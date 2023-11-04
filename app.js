

// working with word list
const wordsList = words.split('\n');
const wordsLength = wordsList.length;

// dom elements
const gameContent = document.querySelector('#content');
const wordCount = document.querySelector('#word-count');
const cursor = document.querySelector('#cursor');
const main = document.querySelector('#main');
const completed = document.querySelector('#completed');
const result = document.querySelector('#result');
const options = document.querySelector('#options');
const newGameButton = document.querySelector('#new-game');
// time variables
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null; 
// entries
let allEntries = null;

// button for limitin
const wordButtons = document.querySelector('#limit-words-buttons');
// const timeButtons = document.querySelector('#limit-time-buttons');
let selectedLimit = wordButtons.querySelector('.selected');
let maxWords;
// wirte word limit to local storage
if (localStorage.getItem('limit') != null) {
    maxWords = parseInt(localStorage.getItem('limit'));
    // localStorage.getItem('selected').classList.add('selected');
    [...wordButtons.children].forEach(x => {
        x.classList.remove('selected');
        if (x.dataset.words == localStorage.getItem('limit')) { 
            x.classList.add('selected');
         }
    });
} else {
    let tempSelected = wordButtons.children[1];
    tempSelected.classList.add('selected');
    maxWords = tempSelected.dataset.words;
}

localStorage.setItem('limit', maxWords);
wordCount.querySelector('#word-limit').innerText = maxWords;

// start new game 
newGame(maxWords);
// start new game based on options
function makeLimit(buttons) {
    buttons.addEventListener('click', e => {
        if (e.target.localName == 'button') {
            document.querySelectorAll('button.option-button').forEach(i => i.classList.remove('selected'));
            e.target.classList.add('selected');
            maxWords = parseInt(e.target.dataset.words);
            console.log(e.target)
            localStorage.setItem('limit',maxWords);

            wordCount.querySelector('#word-limit').innerText = maxWords;
            newGame(localStorage.getItem('limit'));
            e.target.blur();
        };

    
    });
}
makeLimit(wordButtons);

newGameButton.addEventListener('click', e => {
    e.pointerType == 'mouse' ? newGame(maxWords) : '';
});

// get index from all words
function getRandomIndex() {    
    let randomIndex = Math.floor(Math.random() * wordsLength);
    return randomIndex;
}

// make letter elements
function formatWord(word) {
    return `<div id="word" class="word"><letter>${word.split('').join('</letter><letter>')}</div>` 
}

// start game
function newGame(length) {
    gameContent.innerText = '';
    for (let i=0; i<length; i++) {
        gameContent.innerHTML += formatWord(wordsList[getRandomIndex()]);
    }
    document.querySelector('#word').classList.add('current');
    document.querySelector('letter').classList.add('current');
    document.querySelector('header').classList.remove('standard');
    showElements(main);
    hideElements(result);
    updateCount(0);
    allEntries = null;
    clearInterval(window.timer);
    window.timer = null;
    window.gameStart = null; 
    gameContent.style.marginTop = `0px`;
    deactivateCursor();

}
// get cursor to starting position
function deactivateCursor() {
    cursor.classList.remove('active');
    cursor.style.top = `${document.querySelector('letter.current').getBoundingClientRect().top +4}px`
    cursor.style.left = `${document.querySelector('letter.current').getBoundingClientRect().left}px`
}
// remove hidden class
function showElements() {
    [...arguments].forEach(x => x.classList.remove('hidden'))
}
// add hidden class
function hideElements() {
    [...arguments].forEach(x => x.classList.add('hidden'))
}
// word count update
function updateCount(num) {
    completed.innerText = num;
}
// calculations of wpm
function getWPM(time, allEntries) {
    const uncorrectedEntries = gameContent.querySelectorAll('letter.incorrect').length;
    const WPM = ((allEntries/5) - uncorrectedEntries) / (time / 60);
    WPM > 0 ? result.querySelector('#speed-num').innerText = Math.round(WPM) : result.querySelector('#speed-num').innerText = 0;
}
// calculations of accurasy
function getAccuracy(allEntries) {
    const correctEntries = gameContent.querySelectorAll('letter.correct').length + gameContent.querySelectorAll('#word').length - 1;
    const accuracy = correctEntries  / allEntries * 100;
    result.querySelector('#accuracy-num').innerText = `${Math.round(accuracy)}%`;
}

function controlBackspace(element) {
    [...element].forEach(l => {
        l.classList.contains('correct') ? allEntries-- : '';
        l.classList.contains('extra') ? l.remove() : '';
        l.className = '';
    });
}

function gameEnd(main, wordCount, result) {
    clearInterval(window.timer);
    getAccuracy(allEntries );
    showElements(result);
    hideElements(main);
    wordCount.classList.remove('show');
    newGameButton.classList.remove('fade');
    document.querySelector('header').classList.remove('standard');
}

window.addEventListener('keydown', e => {
    // don't start game if words are hidden
    if (main.classList.contains('hidden')) return
    // variables
    let currentLetter = document.querySelector('letter.current');
    let currentWord = document.querySelector('#word.current');
    const key = e.key;
    const isLetter = key.length === 1;
    const isSpace = key === ' ';
    const isBackspace = key === 'Backspace';
    const es = currentLetter?.innerText || ' ';
    document.querySelector('header').classList.add('standard');
    newGameButton.classList.add('fade');
    // options.classList.add('hidden');
    wordCount.classList.add('show');

    if (!window.timer && isLetter) {
        window.timer = setInterval(() => {
            if (!window.gameStart) {
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const currentTimeSeconds = Math.round((currentTime - window.gameStart ) / 1000);
            getWPM(currentTimeSeconds, allEntries);
    }, 1000);
    }

    if (isLetter) {
        if (currentLetter && key != ' ') {
            let cond = key == es ? 'correct' : 'incorrect';
            currentLetter.classList.replace('current',cond);

            if (currentLetter.nextSibling) {
                currentLetter.nextSibling.classList.add('current');
            }
        } else if (es == ' ' && key != ' ') {

            const incorrectLetter = document.createElement('letter');
            incorrectLetter.classList.add('extra');
            const incorrectCount = document.querySelectorAll('#word.current letter.extra');
            if (incorrectCount.length < 10) {
                incorrectLetter.innerText = key;
                currentWord.append(incorrectLetter); 
            }
        }

        allEntries++
    } 
    allEntries ? cursor.classList.add('active') : '';

    if (isSpace) {

        if (!currentWord.nextSibling) return 

        // scroll down for more words
        if (currentWord.nextSibling && currentWord.nextSibling.getBoundingClientRect().top > 510) {
            const margin = parseInt(gameContent.style.marginTop || '0px');
            gameContent.style.marginTop = `${margin - 50}px`;
        }
        // remove space character after the word if there is one
        if (currentLetter && currentLetter.innerText == '') {
            currentLetter.remove();
        }
        // create extra character
        if (es !== ' ') {
            const lettersValidation = [...document.querySelectorAll('#word.current letter:not(.correct)')];
            lettersValidation.forEach(letter => {
                letter.classList.add('incorrect');
                letter.classList.remove('current');
                allEntries++;
            });
            const incorrectLetter = document.createElement('letter');
            incorrectLetter.classList.add('extra');
        }
        // make next word current
        currentWord.classList.remove('current');
        currentWord.nextSibling.classList.add('current');
        currentWord.nextSibling.firstChild.classList.add('current');        

    //  update number of words completed
    const index = [...currentWord.parentElement.children].indexOf(currentWord);
    updateCount(index + 1)
    }

    const isControlBackspace = isBackspace && e.ctrlKey;

    if (isBackspace || isControlBackspace) {
        

        // if it is the first letter of the first word - do nothing
        if (!currentWord.previousSibling && currentLetter == currentWord.firstChild) return 
        // change row
        if (currentLetter == currentWord.firstChild && currentWord.previousSibling.getBoundingClientRect().top < 420) return 


        // if current letter is the first letter of the word - go back to previous word
        if (currentLetter && !currentLetter.previousSibling && currentWord.firstChild == currentLetter) {
            if (isControlBackspace) {
                controlBackspace(currentWord.previousSibling.children);
                currentWord.previousSibling.firstChild.classList.add('current');
            } else {
                const space = document.createElement('letter');
                space.classList.add('extra');
                currentWord.previousSibling.appendChild(space);
                currentWord.previousSibling.lastChild.classList.add('current');
            }

            currentWord.classList.remove('current');
            currentLetter.classList.remove('current');
            currentWord.previousSibling.classList.add('current');
        } 
        // if current letter is in the middle of the word 
        else if (currentLetter && !currentLetter.classList.contains('extra')) {

            if (isControlBackspace) {
                controlBackspace(currentWord.children)
                currentWord.firstChild.classList.add('current');
            } else {
                currentLetter.previousSibling.classList.remove('correct', 'incorrect');
                currentLetter.classList.remove('current');
                currentLetter.previousSibling.classList.add('current');
            }

        } 
        // if backspace was pressed on the last extra letter of the word
        else if (currentWord.lastChild.classList.contains('extra')) {

            if (isControlBackspace) {
                controlBackspace(currentWord.children);
                currentWord.firstChild.classList.add('current');
            } else {
                // if backspace was pressed on empty space element and there are other extra letters
                if (currentWord.lastChild.innerText == '' && currentWord.lastChild.previousSibling.classList.contains('extra')) {
                    currentWord.lastChild.remove();
                    currentWord.lastChild.remove();
                }
                // if backspace was pressed on empty space element
                else if (currentLetter && currentLetter.innerText == '') {
                    currentWord.lastChild.remove();
                    currentWord.lastChild.classList.remove('correct', 'incorrect');
                    currentWord.lastChild.classList.add('current');
                } else {
                    currentWord.lastChild.remove();
                }
            }


        } else {
            // if control + backspace were pressed
            if (isControlBackspace) {
                controlBackspace(currentWord.children);
                currentWord.firstChild.classList.add('current');

            } else {
                currentWord.lastChild.classList.remove('correct', 'incorrect');
                currentWord.lastChild.classList.add('current');
            }


        }
    }
    // move cursor
    const nextLetter = document.querySelector('letter.current');
    const nextWord = document.querySelector('#word.current');

    if (nextLetter) {
        cursor.style.top = `${nextLetter.getBoundingClientRect().top + 4}px`;
        cursor.style.left = `${nextLetter.getBoundingClientRect().left}px`;
    } else {
        cursor.style.top = `${nextWord.getBoundingClientRect().top  + 7}px`;
        cursor.style.left = `${nextWord.getBoundingClientRect().right}px`;
    }

    // create empty space if it's the last letter and end the game
    if (!currentWord.nextSibling && !currentLetter.nextSibling) {
        const incorrectLetter = document.createElement('letter');
        incorrectLetter.classList.add('extra', 'current');
        currentWord.append(incorrectLetter);

    } 
    // user must type last word correctly to end the game
    const lastWord = document.querySelectorAll('#word.current letter');
    const incorrectLettersOfLastWord = [...lastWord].filter(x=> x.classList.contains('incorrect'));
    const noIncorrectLettrs = (incorrectLettersOfLastWord.length == 0);
    
    if (!currentWord.nextSibling && currentLetter.nextSibling.classList.contains('extra') && noIncorrectLettrs && isLetter) {
        gameEnd(main, wordCount, result);
    }
    
})

