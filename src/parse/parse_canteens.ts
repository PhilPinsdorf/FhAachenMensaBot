/*
    Credits to Malte Swart and the OpenMensaParser. I copied the code and rewrote it to TS.
    Cause of multiple issues with the OpenMansaAPI I came to the conclusion to take matters into my own hands.
    https://github.com/mswart/openmensa-parsers/blob/master/parsers/aachen.py
*/

import { JSDOM } from 'jsdom';
import { all_canteens } from '../types/definitions'; 
import { ILegend, IParserConfig,  } from '../types/interfaces';

class Canteen {
    private days: { [key: string]: any } = {};
    private additionalCharges: { [key: string]: any } = {};
    public legend: ILegend = {};

    setAdditionalCharges(type: string, charges: { [key: string]: number }): void {
        this.additionalCharges[type] = charges;
    }

    setDayClosed(day: string): void {
        this.days[day] = { closed: true };
    }

    addMeal(day: string, category: string, name: string[], notes: string[], prices: string): void {
        if (!this.days[day]) {
            this.days[day] = { meals: [] };
        }
        this.days[day].meals.push({ category, name, notes, prices });
    }

    get_canteen_menu(): Object {
        return this.days;
    }
}

export class Parser {
    private baseUrl: string;
    private handler: (url: string) => Promise<object>;
    private definitions: IParserConfig = {};

    constructor(base: string, handler: (url: string) => Promise<object>) {
        this.baseUrl = base;
        this.handler = handler;
    }

    define(name: string, config: { suffix: string }) {
        this.definitions[name] = this.baseUrl + config.suffix;
    }

    async parse(name: string): Promise<object> {
        const url = this.definitions[name];
        if (!url) throw new Error(`Unknown definition: ${name}`);
        return this.handler(url);
    }
}

export function create_parser(): Parser {
    const parser = new Parser('http://www.studierendenwerk-aachen.de/speiseplaene/', parseUrl);

    for (const canteen of all_canteens) {
        parser.define(canteen.identifier, { suffix: canteen.web_suffix });
    }

    return parser;
}

function parseLegend(document: Document): ILegend {
    const regex = /\(([\dA-Z]+)\)\s*([\w\s]+)/g;
    const legendElement = document.getElementById('additives');
    const legendText = legendElement?.textContent || '';
    const legend: ILegend = {};
    let match;
    while ((match = regex.exec(legendText)) !== null) {
        legend[match[1]] = match[2];
    }
    return legend;
};

function parseAllDays(canteen: Canteen, document: Document) {
    const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag',
        'MontagNaechste', 'DienstagNaechste', 'MittwochNaechste', 'DonnerstagNaechste', 'FreitagNaechste'];
    for (const day of days) {
        const dayColumn = document.getElementById(day);
        if (!dayColumn) continue;

        let dayHeader = dayColumn.previousElementSibling?.textContent || '';
        dayHeader = dayHeader.split(', ')[1].replaceAll('.', '-');
        parseDay(canteen, dayHeader, dayColumn);
    }
};

function parseDay(canteen: Canteen, day: string, data: Element) {
    if (isClosed(data)) {
        canteen.setDayClosed(day);
        return;
    }

    const mealsTable = data.querySelector('.menues');
    addMealsFromTable(canteen, mealsTable, day);

    const extrasTable = data.querySelector('.extras');
    addMealsFromTable(canteen, extrasTable, day);
};

function isClosed(data: Element): boolean {
    return !!data.querySelector('#note');
};

function addMealsFromTable(canteen: Canteen, table: Element | null, day: string) {
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const [category, name, notes, prices] = parseMeal(row, canteen.legend);
        if (category && name) {
            canteen.addMeal(day, category, name, notes, prices);
        }
    });
};

function parseMeal(tableRow: Element, legend: ILegend): [string, string[], string[], string | null] {
    const category = tableRow.querySelector('.menue-category')?.textContent?.trim() || '';
    const descriptionContainer = tableRow.querySelector('.menue-desc');
    const cleanDescriptionContainer = getCleanedDescriptionContainer(descriptionContainer);
    const [name, notes] = parseDescription(cleanDescriptionContainer, legend);

    const priceTag = tableRow.querySelector('.menue-price')?.textContent?.trim() || null;

    if (tableRow.classList.contains('vegan')) notes.push('vegan');
    if (tableRow.classList.contains('OLV')) notes.push('OLV');

    return [category, name, notes, priceTag];
};

function getCleanedDescriptionContainer(descriptionContainer: Element | null): Element | null {
    if (!descriptionContainer) return null;

    const effectiveContainer = descriptionContainer.querySelector('.expand-nutr') || descriptionContainer;

    Array.from(effectiveContainer.children).forEach(child => {
        if (!(child instanceof HTMLElement) ||
            (child.tagName === 'SPAN' && child.classList.contains('seperator') && !child.textContent?.trim()) ||
            child.tagName === 'SUP') {
            return;
        }
        child.remove();
    });

    return effectiveContainer;
};

function parseDescription (descriptionContainer: Element | null, legend: ILegend): [string[], string[]] {
    if (!descriptionContainer) return [[], []];

    let nameParts: string[] = [];
    const notes = new Set<string>();

    Array.from(descriptionContainer.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'SUP') {
        const noteText = node.textContent?.trim() || '';
        noteText.split(',').forEach(note => notes.add(note));
        } else if (node.nodeType === Node.TEXT_NODE) {
        nameParts.push(node.textContent?.trim() || '');
        }
    });

    nameParts = nameParts.flatMap(entry => entry.split('|').map(item => item.trim())).filter(item => item !== '');
    const resolvedNotes = Array.from(notes).map(note => legend[note] || note);

    return [nameParts, resolvedNotes];
};

async function parseUrl(url: string): Promise<object> {
    const canteen = new Canteen();
    const response = await fetch(url); 
    const html = await response.text(); 
    const { window } = new JSDOM(html); 
    const document = window.document;

    global.HTMLElement = window.HTMLElement;
    global.Element = window.Element;
    global.Node = window.Node

    canteen.setAdditionalCharges('student', { other: 1.5 });
    canteen.legend = parseLegend(document);

    parseAllDays(canteen, document);

    return canteen.get_canteen_menu();
};