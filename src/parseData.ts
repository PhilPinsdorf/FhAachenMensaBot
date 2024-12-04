import * as cheerio from 'cheerio';

interface Meal {
    category: string;
    name: string;
    notes: string[];
    price: string;
}

interface Menue {
    meals: Meal[];
    sides?: string;
    vegetables?: string;
    open: boolean;
    legend?: Legend; 
}

interface Legend {
    [key: string]: string;
}

const parseUrl = async (url: string): Promise<any> => {
    const canteen: Menue = {
        meals: [],
        open: true, // assume open by default
    };

    // Fetch the HTML document
    const response = await fetch(url);
    const data = await response.text();
    const $: cheerio.Root = cheerio.load(data);

    // Parse the legend (additives)
    canteen.legend = parseLegend($);

    // Parse only "today" and "tomorrow" days
    await parseDay(canteen, $, 'Montag');
    await parseDay(canteen, $, 'Dienstag');

    return canteen;
}

const parseLegend = ($: cheerio.Root): Legend => {
    const legend: Legend = {};
    const legendText = $('#additives').text();
    const regex = /\(([\dA-Z]+)\)\s*([\w\s]+)/g; // Entferne ?P<name> und ?P<value>
    let match;
    while ((match = regex.exec(legendText)) !== null) {
        const name = match[1];   // Erste Gruppe: name
        const value = match[2];  // Zweite Gruppe: value
        legend[name] = value;
    }
    return legend;
}

const parseDay = async (canteen: Menue, $: cheerio.Root, day: string): Promise<void> => {
    const dayColumn = $(`#${day}`);
    if (!dayColumn.length) {
        canteen.open = false; // Assume closed if no day column
        return;
    }

    // Check if it's closed
    const closedNote = dayColumn.find('#note');
    if (closedNote.length) {
        canteen.open = false;
        return;
    }

    // Parse meals for today/tomorrow
    const mealsTable = dayColumn.find('.menues');
    addMealsFromTable($, canteen, mealsTable, day);

    // Parse extras if available
    const extrasTable = dayColumn.find('.extras');
    addMealsFromTable($, canteen, extrasTable, day);
}

const addMealsFromTable = ($: cheerio.Root, canteen: Menue, table: cheerio.Cheerio, day: string): void => {
    table.find('tr').each((_, row) => {
        const { category, name, notes, price } = parseMeal($, $(row), canteen.legend);
        if (category && name) {
            canteen.meals.push({
                category,
                name,
                notes,
                price,
            });
        }
    });
}

const parseMeal = ($: cheerio.Root, row: cheerio.Cheerio, legend: Legend): { category: string, name: string, notes: string[], price: string } => {
    const category = row.find('.menue-category').text().trim();
    const descriptionContainer = row.find('.menue-desc');
    const { name, notes } = parseDescription($, descriptionContainer, legend);

    const priceTag = row.find('.menue-price').text().trim();
    const price = priceTag || '';

    const additionalNotes = [];
    if (row.hasClass('vegan')) additionalNotes.push('vegan');
    if (row.hasClass('OLV')) additionalNotes.push('OLV');

    notes.push(...additionalNotes);

    return { category, name, notes, price };
}

const parseDescription = ($: cheerio.Root, descriptionContainer: cheerio.Cheerio, legend: Legend): { name: string, notes: string[] } => {
    let nameParts: string[] = [];
    let notes: Set<string> = new Set();

    descriptionContainer.contents().each((_, el) => {
        const element = $(el);
        if (element.is('sup')) {
            notes.add(element.text().trim());
        } else if (element.text().trim()) {
            nameParts.push(element.text().trim());
        }
    });

    const name = nameParts.join(' ').replace(/\s+/g, ' ').trim();
    notes = new Set([...notes].map(note => legend[note] || note)); // Translate notes using the legend

    return { name, notes: Array.from(notes) };
}

// Example usage
const url = 'http://www.studierendenwerk-aachen.de/speiseplaene/academica-w.html';
parseUrl(url).then(canteen => {
    console.log(JSON.stringify(canteen, null, 2));
});