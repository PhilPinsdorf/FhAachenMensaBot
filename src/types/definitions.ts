import { ICanteen, ICanteenGroup } from './interfaces';

export const all_canteens: ICanteen[] = [
  {
    name: "Mensa Academica",
    identifier: "academica",
    web_suffix: "academica-w.html",
    canteen_id: 1,
  },
  {
    name: "Mensa Vita",
    identifier: "vita",
    web_suffix: "vita-w.html",
    canteen_id: 2,
  },
  {
    name: "Mensa Ahorn",
    identifier: "ahorn",
    web_suffix: "ahornstrasse-w.html",
    canteen_id: 3,
  },
  {
    name: "Mensa Bistro Tempelgraben",
    identifier: "templergraben",
    web_suffix: "templergraben-w.html",
    canteen_id: 4,
  },
  {
    name: "Mensa Eupener Straße",
    identifier: "eups",
    web_suffix: "eupenerstrasse-w.html",
    canteen_id: 5,
  },
  {
    name: "Mensa Bayernallee",
    identifier: "bayernallee",
    web_suffix: "bayernallee-w.html",
    canteen_id: 6,
  },
  {
    name: "Mensa Südpark",
    identifier: "suedpark",
    web_suffix: "suedpark-w.html",
    canteen_id: 7,
  },
  {
    name: "Mensa Zeltmensa",
    identifier: "zeltmensa",
    web_suffix: "forum-w.html",
    canteen_id: 8,
  },
  {
    name: "Mensa Jülich",
    identifier: "juelich",
    web_suffix: "juelich-w.html",
    canteen_id: 9,
  },
  {
    name: "Mensa Goethe",
    identifier: "goethe",
    web_suffix: "goethestrasse-w.html",
    canteen_id: 10,
  },
];

// groups have to use a canteen_group_id >= 100
// canteens have to use a canteen_id < 100
export const max_canteen_id = 99;

export const all_canteen_groups: ICanteenGroup[] = [
  {
    name: "Mensen Eupener Straße & Südpark",
    canteen_group_id: 100,
    canteens: [
      all_canteens.find(c => c.identifier === "eups"),
      all_canteens.find(c => c.identifier === "suedpark")
    ]
  }
];

export const greetings: string[] = [
  "Hallo",
  "Hey",
  "Hi",
  "Guten Morgen",
  "Guten Tag",
  "Moin",
  "Hallöchen",
  "Heyho",
  "Schönen guten Tag",
  "Huhu",
  "Mahlzeit",
  "Was geht",
  "Hej",
  "Hallihallo",
];

export const replys: { [key: string]: (...args: string[]) => string } = {
  start: (name: string) => `Danke ${name}, dass du dich für den Dienst angemeldet hast! \n\nDu bekommst ab jetzt jeden Tag um \*9:30 Uhr\* eine Benachrichtigung darüber, was es heute in deiner Aachener Mensa zu essen gibt. Falls du zwischendurch nachgucken möchtest, was es heute und morgen in der Mensa gibt, kannst du das jederzeit mit /today und /tomorrow tun. Falls du Updates von einer anderen Mensa bekommen möchtest, kannst du deine Mensa mit /canteen ändern. Die Mensa Eupener Straße ist standartmäßig am Anfang ausgewählt. Falls du Updates zu einer anderen Zeit bekommen möchtest, kannst du deine Zeit mit /time ändern. Du kannst dir Infos über Allergene und Inhaltsstoffe mit /allergens zu deiner täglichen Nachicht hinzufügen. \n\nMit /stop kannst du dich von diesem Dienst wieder abmelden. \n\nBei Rückfragen oder Bugs, schreibe @philpinsdorf auf Telegram an.`,
  stop: (name: string) => `Vielen Dank ${name}, dass du meinen Dienst verwendet hast. \n\nDu hast hiermit deinen Account \*gelöscht\* und wirst in Zukunft \*keine Benachichtigungen\* mehr bekommen. \n\nFalls du dich doch umentscheiden solltest kannst du jederzeit dich mit /start wieder anmelden.`,
  only_after_start: () => `Du musst diesen Dienst erst mit /start abbonieren!`,
  already_registered: () => `Du hast dich bereits registriert.`,
  already_deleted: () => `Dein Account wurde bereits gelöscht.`,
  select_canteen: () => `\*Wähle deine Mensa aus:\*`,
  with_allergenes: () => `Du bekommst absofort alle updates \*mit\* Allergie & Inhaltsstoff Angaben.\n\n\*Ich übernehme keine Haftung für die vollständigkeit und die Richtigkeit dieser Daten. Die Daten können falsch oder unvollständig sein.\*`,
  without_allergenes: () => `Du bekommst absofort alle updates \*ohne\* Allergie & Inhaltsstoff Angaben.`,
  code: () => `https://github.com/PhilPinsdorf/FhAachenMensaBot`,
  issue: () =>  `Report your bug by creating a new Issue here:\nhttps://github.com/PhilPinsdorf/FhAachenMensaBot/issues/new\n\nAlternatively you can write @philpinsdorf on Telegram.`,
  time_no_args: () => `Um deine Zeit der Nachicht zu ändern gebe bitte den Command \*\'/time hh\\:mm\'\* ein. \nHierbei ist die Zeit wievolgt anzugeben: \n08:13, 15:42, 11:18 etc. \n\n\*Bitte bechachte\*, dass die neuen Gerichte um 3:00 morgens eingelesen werden. Anfragen davor führen dazu, dass du das Menü von gestern geschickt bekommst.`,
  time_wrong_format: () => `Die Uhrzeit wurde nicht richtig eingegeben! \nBitte gebe die Uhrzeit wie folgt ein: \n\*\'/time hh:mm\'\*\n\n\*Beispiel:\* '/time 08:45'`,
  time: (time) => `Du erhältst ab sofort Updates um \*${time}\*!`,
  canteen: (canteen_name) => `Du erhältst ab sofort tägliche Updates von der \*${canteen_name}\*.`,
}