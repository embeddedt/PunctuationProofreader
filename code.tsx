
import "core-js/stable";
import "regenerator-runtime";

import './components/import-jquery';

import 'popper.js';
import 'bootstrap';

import React from 'react';
import ReactDOM from 'react-dom';

import '@fortawesome/fontawesome-free/css/all.css';

import GameTools from './components/gametools/GameTools';
import InfoBox from './components/gametools/InfoBox';
import HelpButton from './components/gametools/HelpButton';
import { startCheck } from './components/gametools/AntiCheat';
import DisplayedItem, { initializeArray, startDisplay, GameArrayItem } from './components/gametools/DisplayedItem';
import Label from './components/gametools/Label';
import { Question, QuestionType } from './components/gametools/Question';
import Invoke from './components/gametools/Invoke';
import Loop from "./components/gametools/Loop";
import SetBackground from "./components/gametools/SetBackground";
import ButtonFinder from "./components/gametools/ButtonFinder";
import Condition from "./components/gametools/Condition";
import CapitalCorrector from "./components/gametools/CapitalCorrector";
import Branch from "./components/gametools/Branch";


let currentCategory = 0;

type PunctuationQuestion = {
    capital_question?: string;
    punctuation_question?: string;
    extraHint?: string;
    right: string;
};

function generatePunctQuestion(indexNum: number, realSentence: PunctuationQuestion): GameArrayItem {
    const instructions = (function(): string {
        if(currentCategory == 2)
            return '<p>You must use an Oxford comma on these questions.</p><p>A comma that is used before the word "<i>and</i>" in a list is called an Oxford comma.</p><p>Some people normally do not use Oxford commas: "cows, horses, pigs and sheep", but this game requires it.</p><hr/>';
        else if(realSentence != null && realSentence != undefined)
            return realSentence.extraHint;
        else
            return undefined;
    })();
    if(realSentence != null && realSentence != undefined) {
        return new Invoke(async() => {
            await new Promise((resolve) => {
                /* Figure out what components we need */
                const capital_answer = GameTools.pl_undef(realSentence.punctuation_question, realSentence.right);
                const hasCapitals = (realSentence.capital_question != undefined);
                const hasPunctuation = (realSentence.punctuation_question != undefined);
                const questionHeading = ` <small class='text-muted'>Question ${indexNum + 1} of ${questions[currentCategory].length}</small>`;
                const array = [
                    hasCapitals ? new CapitalCorrector(realSentence.capital_question, capital_answer, `${hasPunctuation ? 'First, c' : 'C'}orrect the capitalization of the sentence.` + questionHeading) : Label.label(""),
                    hasPunctuation ? new Question(QuestionType.FillInTheBlank, "Correct the punctuation and/or meaning of the following sentence." + questionHeading, [ { html: realSentence.right, correct: true } ], true, { defaultValue: realSentence.punctuation_question, stripPunctuation: false, showMobileTips: false, spellCheck: false }, instructions) : Label.label(""),
                    new Invoke(() => resolve())
                ];
                initializeArray(array);
                startDisplay(array);
            });
        });
        /* return new Question(QuestionType.FillInTheBlank, `Correct the capitalization, punctuation, and/or meaning of the following sentence. <small class='text-muted'>Question ${indexNum + 1} of ${questions[currentCategory].length}</small>`, [ { html: realSentence.right, correct: true } ], true, { defaultValue: realSentence.wrong, stripPunctuation: false, showMobileTips: false, spellCheck: false }, instructions); */
    } else
        return Label.label("");
}

type TenOfType<T> = [T, T, T, T, T, T, T, T, T, T];
type FiveOfType<T> = [T, T, T, T, T];
const questions: (TenOfType<PunctuationQuestion>|FiveOfType<PunctuationQuestion>)[] = [
    [
        {
            capital_question: "his name is Mike.",
            right: "His name is Mike."
        },
        {
            punctuation_question: "They went to the park today",
            right: "They went to the park today."
        },
        {
            capital_question: "holly was so excited that she skipped home from school",
            punctuation_question: "Holly was so excited that she skipped home from school",
            right: "Holly was so excited that she skipped home from school."
        },
        {
            capital_question: "that man in a suit is our principal.",
            right: "That man in a suit is our principal."
        },
        {
            capital_question: "are you sure that you are ready",
            punctuation_question: "Are you sure that you are ready",
            right: "Are you sure that you are ready?"
        },
        {
            punctuation_question: "Get back here",
            right: "Get back here!"
        },
        {
            capital_question: "watch out",
            punctuation_question: "Watch out",
            right: "Watch out!"
        },
        {
            punctuation_question: "Are you trying to cheat!",
            right: "Are you trying to cheat?"
        },
        {
            capital_question: "absolutely not",
            punctuation_question: "Absolutely not",
            right: "Absolutely not!"
        },
        {
            punctuation_question: "I hope you're not lying",
            right: "I hope you're not lying."
        }
    ],
    [
        {
            capital_question: "the man's name is mr. Philips.",
            right: "The man's name is Mr. Philips."
        },
        {
            capital_question: "I had a great day at school Today!",
            right: "I had a great day at school today!"
        },
        {
            capital_question: "There is only one way to win this Contest.",
            right: "There is only one way to win this contest."
        },
        {
            capital_question: "I cannot believe This!",
            right: "I cannot believe this!"
        },
        {
            capital_question: "And now, let's hear from the mayor of our town, mr. james fundy!",
            right: "And now, let's hear from the mayor of our town, Mr. James Fundy!"
        },
        {
            capital_question: "Mr. Fundy is here to talk about improvements to The Transit System.",
            right: "Mr. Fundy is here to talk about improvements to the transit system."
        },
        {
            capital_question: "We believe that transit is fundamental to everyday Life.",
            right: "We believe that transit is fundamental to everyday life."
        },
        {
            capital_question: "To this end, We will be increasing the amount of buses during the day.",
            right: "To this end, we will be increasing the amount of buses during the day."
        },
        {
            capital_question: "The new transit Plan will deliver substantial improvements to our Customers.",
            right: "The new transit plan will deliver substantial improvements to our customers."
        },
        {
            capital_question: "Are there any Questions or Concerns?",
            right: "Are there any questions or concerns?"
        }
    ],
    [
        {
            punctuation_question: "This is your 1:01 Meadow Heights westbound train, stopping at Hudson Northcliff, and Riverside.",
            right: "This is your 1:01 Meadow Heights westbound train, stopping at Hudson, Northcliff, and Riverside."
        },
        {
            punctuation_question: "As a note, the heaters in train cars 105, 277 333, and 543 are not working.",
            right: "As a note, the heaters in train cars 105, 277, 333, and 543 are not working."
        },
        {
            punctuation_question: "Once you disembark at Riverside, Riverside Transit buses on Routes 31, 24 and 78 are available to take you to your destinations.",
            right: "Once you disembark at Riverside, Riverside Transit buses on Routes 31, 24, and 78 are available to take you to your destinations."
        },
        {
            punctuation_question: "Do you want to buy, a tablet, a phone, or a laptop?",
            right: "Do you want to buy a tablet, a phone, or a laptop?"
        },
        {
            punctuation_question: "Marie, bought, apples, oranges, and, bananas.",
            right: "Marie bought apples, oranges, and bananas."
        }
    ],
    [
        {
            punctuation_question: "Jones went to Walmart but Anne, went to Target.",
            right: "Jones went to Walmart, but Anne went to Target."
        },
        {
            punctuation_question: "We have a 30% off sale on fruit and a 20% off sale, on electronics!",
            right: "We have a 30% off sale on fruit, and a 20% off sale on electronics!"
        },
        {
            punctuation_question: "We wanted to use a train but we ended up having to use a bus instead.",
            right: "We wanted to use a train, but we ended up having to use a bus instead."
        },
        {
            punctuation_question: "This is a closed-book, test.",
            right: "This is a closed-book test."
        },
        {
            punctuation_question: "If I can't have it no one can!",
            right: "If I can't have it, no one can!"
        }
    ],
    [
        {
            punctuation_question: "As they have multiple deadlines at the end of the semester the more work students can complete earlier on, the better.",
            right: "As they have multiple deadlines at the end of the semester, the more work students can complete earlier on, the better."
        },
        {
            punctuation_question: "Once we successfully hack this game we will have all the answers and be unstoppable!",
            right: "Once we successfully hack this game, we will have all the answers and be unstoppable!"
        },
        {
            punctuation_question: "Nice try but cheaters never prosper.",
            right: "Nice try, but cheaters never prosper."
        },
        {
            punctuation_question: "Whether or not it will rain today, remains to be seen.",
            right: "Whether or not it will rain today remains to be seen."
        },
        {
            punctuation_question: "Just so you know this category is done now.",
            right: "Just so you know, this category is done now."
        }
    ],
    [
        {
            punctuation_question: "Martin Mersenich was quoted as saying Did you know that it rains birds?",
            right: 'Martin Mersenich was quoted as saying, "Did you know that it rains birds?"'
        },
        {
            punctuation_question: 'When asked for comment, the reporter said, "It remains to be seen whether or not the criminals will receive a life sentence".',
            right: 'When asked for comment, the reporter said, "It remains to be seen whether or not the criminals will receive a life sentence."'
        },
        {
            punctuation_question: 'We need to work fast. said Betty.',
            right: '"We need to work fast," said Betty.'
        },
        {
            punctuation_question: 'The first and last letters of titles should not be capitalized.',
            right: 'The first and last letters of titles should be capitalized.',
            extraHint: 'You need to change the meaning of this sentence, not add quotation marks.'
        },
        {
            punctuation_question: 'As a wise linguist once said, Comma splicing is bad, don\'t do it.',
            right: 'As a wise linguist once said, "Comma splicing is bad, so don\'t do it."',
            extraHint: "Hint: Comma splicing is bad, so don't do it."
        }
    ]
];

function catQuestion(index: number): () => GameArrayItem {
    return () => generatePunctQuestion(index, questions[currentCategory][index]);
}

const catNames = new Map<string, number>([
    [ "Beginning capitals and ending punctuation", 0 ],
    [ "Capitals", 1 ],
    [ "Commas in a series", 2 ],
    [ "Commas with compound sentences", 3 ],
    [ "Commas with introductory phrases", 4 ],
    [ "Quotation punctuation", 5 ]
]);
let usedLink = false;

let finderResult: boolean = false;
const myArray = [
    new SetBackground(require('./punctuation.png')),
    Label.label("category_selection"),
    new Invoke(() => {
        return new Promise((resolve) => {
            if(GameTools.directLink != "") {
                for(let [key, val] of catNames) {
                    if(GameTools.directLink == GameTools.slugify(key)) {
                        console.log(GameTools.directLink + " mapped to category: " + val);
                        usedLink = true;
                        currentCategory = val;
                        break;
                    }
                }
                if(usedLink) {
                    new Branch({ index: "catQuestions" }).setParentArray(myArray, true).display();
                    return; /* do not resolve */
                } else {
                    console.warn("Unknown link: " + GameTools.directLink);
                }
            }
            resolve();
        });
    }),
    new ButtonFinder("Choose a category.", "", [
        "Beginning capitals and ending punctuation",
        "Capitals",
        "Commas in a series",
        "Commas with compound sentences",
        "Commas with introductory phrases",
        "Quotation punctuation"
    ], 0, () => "Choose a category.").setLayer(2),
    new Invoke(() => finderResult = GameTools.lastResult),
    new Invoke(() => currentCategory = GameTools.lastData),
    Label.label("catQuestions"),
    catQuestion(0),
    catQuestion(1),
    catQuestion(2),
    catQuestion(3),
    catQuestion(4),
    catQuestion(5),
    catQuestion(6),
    catQuestion(7),
    catQuestion(8),
    catQuestion(9),
    new Condition(new Loop({ index: "fireworks" }), Label.label(""), () => (finderResult || usedLink)),
    new InfoBox("Great job!", "You answered all the questions in this category.<p></p>Now you can try another one!", "OK"),
    Label.label("fireworks"),
    new SetBackground(require('./components/fireworks.jpg')),
    new InfoBox("Nice work!", `<img class='img-fluid' src='${require('./components/happy_face.png')}'/><p></p>You've finished!`, null)
];

$(async function() {
    
    console.log(process.env.NODE_ENV);
    let badge = undefined;
    if(process.env.NODE_ENV == 'production') {
        await GameTools.sleep(3000-((window as any).load_endDate - (window as any).load_startDate));
    } else
        badge = <span>&nbsp;<span className="badge badge-secondary">development version</span></span>;
    GameTools.monkeyPatch();
    startCheck();
    GameTools.helpRef = React.createRef();
    ReactDOM.render(<>
        <span className="top-title">{document.title}{badge}</span>
        <div className="top-buttons">
            <HelpButton ref={GameTools.helpRef} name="Help" icon="fas fa-question" colorClass="btn-info"/>
        </div>
    </>, $("#top-bar").get(0));
    initializeArray(myArray);
    startDisplay(myArray);
});