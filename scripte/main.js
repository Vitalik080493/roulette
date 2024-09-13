"use strict";
const textarea = document.getElementById("resultsTextarea");
const timerGame = document.getElementById('timer').firstElementChild;

const nameUser = "GG";

// Получаем значение куки с именем "enlogin"
// const enloginCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('enlogin='));

// Если куки "enlogin" установлено, присваиваем его значение переменной nameUser
// const nameUser = enloginCookie ? enloginCookie.split('=')[1] : "";

let chipActive = null; // активная фишка
let bet = "1"; // выбранная фишка
let arrayBetSet = [0, 0, 0, 0, 0]; // массив столов пользователя со сделанными ставками
// let gameStartOld = false;
let gameStart = false;
let timeGlobal = false;
let gameCurbox = false;
let gameStatus = 0;
let gameStatusOld = null;
let gameUser = false;
let playerAtTable = false;
let activeTableOld = false;

const arrayBets = [0.2, 0.5, 1, 2, 5];
const alertMessages = [
    'Для начала игры сядьте за любое свободное место за столом, нажав кнопку Сесть за стол',
    'Выберите ставку - фишки в правом нижнем углу - и нажмите кнопку Сделать ставку',
    'Раунд окончен. Ваш выигрыш - ',
];
const messagesResult = [
    '&bull; Раунд стартовал\n',
    '&bull; Раунд закончен\n',
    '&bull; Сумма ваших ставок: ',
    'Сумма выигрыша: ',
    '"Страховка" на сумму '
];

let currentTable = null; // выбранный стол
let time = 0;
let interval = null; // таймер
let timerMessageShow = null;

let currentMenu = 'contanerTextarea'; // выбранный раздел меню

// меню
function selectMenu(name){
    if(currentMenu != name){
        document.getElementById(currentMenu).classList.add('none');
        document.getElementById(name).classList.remove('none');
        currentMenu = name;
    }
};

// выбираем фишку
function setShadowButton(e, n){
    if(chipActive != e){
        e.classList.add('shadowButton');
        if (chipActive != null){
            chipActive.classList.remove('shadowButton');
        }
        chipActive = e;
        bet = n;
    }
};

// установить фишку
function setChipBlock(e, name){
    const chip = e.firstElementChild;
    switch (bet) {
        case '1':
            chip.classList.add('chipBlue');
            chip.firstElementChild.textContent = "0.2";
            break;
        case '2':
            chip.classList.add('chipGreen');
            chip.firstElementChild.textContent = "0.5";
            break;
        case '3':
            chip.classList.add('chipYellow');
            chip.firstElementChild.textContent = "1";
            break;
        case '4':
            chip.classList.add('chipRed');
            chip.firstElementChild.textContent = "2";
            break;
        case '5':
            chip.classList.add('chipPink');
            chip.firstElementChild.textContent = "5";
            break;   
        default:
            break;
    }
    chip.classList.toggle('none');

}

// таймер игры
function startTimerGame(){ 
    interval = setInterval("setTimerGame()", 1000) 
};
function setTimerGame(){
    if(time < 1) {
        clearInterval(interval);
        timerGame.classList.remove('redColor');
    }
    if(time == 10){
        timerGame.classList.add('redColor');
    }
    timerGame.textContent = time;
    --time;
};

// таймер сообщений
function startTimerAlert(numberMessage, time){ // передаем номер сообщения в массиве и кол-во милисекун задержки
    timerMessageShow = setTimeout(showAlertMessage, time, numberMessage) 
}
function showAlertMessage(numberMessage, n = ''){
    document.getElementById('alertMessage').firstElementChild.textContent = alertMessages[numberMessage]+n;
    document.getElementById('alertMessage').classList.remove('none');
    setTimeout(()=>{document.getElementById('alertMessage').classList.add('none')}, 4000)
}

let arrayUserName = [];
let arrayCardsGame = null; // массив карт
let arrayChipsGame = [];
let arrayBlackjack = [];
let arrayStatistick = [];

let arrayShowUserName = []; //[false, false, false, false, false]; // массив занятых полей с именами пользователей
let arrayNames = ['cardGame', 'cardPlayer1', 'cardPlayer2', 'cardPlayer3', 'cardPlayer4', 'cardPlayer5'];
let arrayNamesChip = [
    ['chipUser1','insuranceChipUser1'],
    ['chipUser2','insuranceChipUser2'],
    ['chipUser3','insuranceChipUser3'],
    ['chipUser4','insuranceChipUser4'],
    ['chipUser5','insuranceChipUser5'],
];
let arrayResultsName = [
    'alertResultGame',
    'alertResultPlayer1',
    'alertResultPlayer2',
    'alertResultPlayer3',
    'alertResultPlayer4',
    'alertResultPlayer5'
]
// запускаем таймер для сообщении чтобы сесть за стол
startTimerAlert(0, 15000);

// getData();
// let game = setInterval(getData, 3000, 'https://damask.mycarnage.ru/carnagejack.php?cmd=default');

// получаем данные с сервера для установки состояния стола
function getData(request){
    try{
        fetch(request)
            .then(response => response.json())
            .then(data => {
                setTable(data);
            })
            // .catch(error => console.error('Ошибка:', error.message));
    }
    catch{err => console.error(err.message)};
}

// устанавливаем состояние стола
function setTable(data){
    // console.log(data);
    // получаем статус игры
    timeGlobal = data.table.state.timer; // время таймера на сервере
    gameCurbox = data.table.state.curbox; // активный стол игрока 1-5
    gameStatus = data.table.state.status; // статус игры 0-3, 0 все столы пустые, 1 есть занятый стол, 2 идет игра, 3 результаты игры
    gameUser = data.table.state.user; // активный пользователь

    // Первая загрузка страницы
    if(gameStatusOld == null){
        gameStatusOld = 0;
        getStatictickTable(data);
    }

    // спрятать все имена и кнопки игрока после окончания игры
    if(gameStatus == 0 & gameStatusOld != gameStatus){
        [1,2,3,4,5].forEach(n => {
            hideUserName(n);
            showHidenButtonPlayer(n, false);
            showHidenButtonSitTable(n, true);
            showHidenChip((n - 1), [false, false]);
        });
        showHidenButtonBackTable(false);
        arrayShowUserName = [];
        showHidenButtonRepeatBids(false);
        getStatictickTable(data);
        console.log("0");
    }

    // таймер
    if(gameStatus > 0){
        if (time < 1){ 
            clearInterval(interval);
            time = data.table.state.timer;
            if(time > 0) {
                time > 10 ? timerGame.classList.remove('redColor') : timerGame.classList.add('redColor');
                startTimerGame();
            }
        };
    }

    if(gameStatus == 1 || gameStatus == 2){
        // Фишки
        arrayChipsGame = [
            [data.table.boxes.box1.hand[0].bet, data.table.boxes.box1.insurance],
            [data.table.boxes.box2.hand[0].bet, data.table.boxes.box2.insurance],
            [data.table.boxes.box3.hand[0].bet, data.table.boxes.box3.insurance],
            [data.table.boxes.box4.hand[0].bet, data.table.boxes.box4.insurance],
            [data.table.boxes.box5.hand[0].bet, data.table.boxes.box5.insurance],
        ];
        arrayChipsGame.forEach((chips, index) => {
            showHidenChip(index, chips);
        });
    }

    if(gameStatus == 1){
        // убрать карты если до этого была игра
        if(gameStart) {
            gameStart = false;
            arrayCardsGame.forEach((cards, index, array) => {
                if (cards.length > 0) {
                    deleteCard(arrayNames[index], array[index]);
                }
            });
            //hideCards();
            [0,1,2,3,4,5].forEach(n => {
                showHidenResults((n), false)
                if(n > 0) showHidenBlackjack(n, false)
            });
            showHidenButtonRepeatBids(true);
        }

        // имена
        arrayUserName = [
            data.table.boxes.box1.user, 
            data.table.boxes.box2.user, 
            data.table.boxes.box3.user, 
            data.table.boxes.box4.user, 
            data.table.boxes.box5.user
        ];
        arrayUserName.forEach((userName, index) => checkUserName(userName, index));

        playerAtTable = false; // пользователь сидит хотябы за одним столом
        // arrayShowUserName = [false, false, false, false, false]; // очищаем для проверки
        // проверяем за каким столом сидит пользователь и отображаем кнопки пользователя
        arrayShowUserName.forEach((user, index) =>{ 
            if(user == nameUser){ // 
                showHidenButtonPlayer((index+1), true); // показать кнопки сделать ставку и покинуть стол
                playerAtTable = true;
            }
            else showHidenButtonPlayer((index+1), false);

            showHidenButtonSitTable((index+1), !user); // прячем кнопку сесть за стол, если есть пользователь за столом

        });
        showHidenButtonBackTable(playerAtTable);
        

        console.log("1");
    }

    if(gameStatus == 2){
        showHidenButtonRepeatBids(false);
        showHidenButtonGame(true);

        // выделяем активное поле
        if(gameCurbox > 0 && gameCurbox != activeTableOld) {
            activeTable(gameCurbox, true);
            if(activeTableOld) activeTable(activeTableOld, false);
            activeTableOld = gameCurbox;
        }
        if (gameStatusOld != gameStatus) addRowStatistick(0); 

        console.log("2");
    }

    if(gameStatus > 1){
        gameStart = true;
        [1,2,3,4,5].forEach(n => {
            showHidenButtonPlayer(n, false);
            showHidenButtonSitTable(n, false);
        });
        showHidenButtonBackTable(false);

        // blackjack
        arrayBlackjack = [
            data.table.boxes.box1.blackjack,
            data.table.boxes.box2.blackjack,
            data.table.boxes.box3.blackjack,
            data.table.boxes.box4.blackjack,
            data.table.boxes.box5.blackjack,
        ];
        arrayBlackjack.forEach((element, index) => {
            showHidenBlackjack((index + 1), element);
        });

        // Карты
        arrayCardsGame = [
            data.table.dealer.hand,
            data.table.boxes.box1.hand[0].cards,
            data.table.boxes.box2.hand[0].cards,
            data.table.boxes.box3.hand[0].cards,
            data.table.boxes.box4.hand[0].cards,
            data.table.boxes.box5.hand[0].cards,

        ];
        arrayCardsGame.forEach((cards, index, array) => {
            if (cards.length > 0) {
                showCard(arrayNames[index], array[index]);
                // очки
                let point = 0;
                if (cards.length == 1) {
                    point = cards[0].point
                }
                else {
                    point = cards.reduce((acc, val) => acc + val.point, 0);
                }
                if(index > 0){ if(!arrayBlackjack[index - 1]) showHidenResults(index, true, point)} // показать очки игрока если у него не блэкджек
                else showHidenResults(index, true, point) // показать очки админа
            }
            else {
                showHidenResults(index, false)
            }
        });    
    }

    if(gameStatus == 3){
        showHidenButtonGame(false);
        if(activeTableOld) {
            activeTable(activeTableOld, false);
            activeTableOld = false;
        }
        if (gameStatusOld != gameStatus) {
            // const sumBets = arrayBetSet.reduce((acc, val) => acc += val)
            const sumBets = data.table.statistic.betsum;
            let winBet = '0';
            if(!!data.table.statistic.winbet) winBet = data.table.statistic.winbet;
            addRowStatistick(1);
            addRowStatistick(2, sumBets+'\n');
            addRowStatistick(3, winBet+'\n');

            showAlertMessage(2, winBet);
        }

        console.log("3");
    }

    if (gameStatusOld != gameStatus) gameStatusOld = gameStatus
}

// проверить на наличие игрока
function checkUserName(user, n){
    if(user) { // стол занят
        if(user != arrayShowUserName[n]){
            arrayShowUserName[n] = user; // записываем в массив занятых полей
            showUserName(n+1, user)
        }
    }
    else { // стол свободен
        if(user != arrayShowUserName[n]){
            hideUserName(n+1, user)
            arrayShowUserName[n] = false;
        }
    }
};
// показать имя игрока
function showUserName(number, user){
    document.getElementById('nameUser'+number).firstChild.textContent = user;
    document.getElementById('nameUser'+number).classList.remove('none');
};
// спрятать имя игрока
function hideUserName(number){
    // document.getElementById('nameUser'+number).firstChild.textContent = user;
    document.getElementById('nameUser'+number).classList.add('none');
};

// показать карты
function showCard(name, array){     // ???
    array.map((card, index) => {
        let c = document.getElementById(name+(index+1));
        c.classList.add(arrayCard[card.type]);
        c.classList.remove('none');
    }); 
};

// удаляем классы карт и убираем их с поля
function deleteCard(name, array){     // ???
    array.forEach((card, index) => {
        let c = document.getElementById(name+(index+1));
        c.classList.remove(arrayCard[card.type]);
        c.classList.add('none');
    }); 
};
// убрать все карты
// function hideCards(){
//     document.querySelectorAll('.card').forEach(card => card.classList.add('none'));
// };

// показать монеты
function showHidenChip(number, chips){ // получаем имя стола и фишки (ставка, страховка)
    chips.forEach((bet, index) =>{
        const chip = document.getElementById(arrayNamesChip[number][index]); // находим фишку в DOM
        if(index == 0) !bet ? chip.classList.add('hiden') : chip.classList.remove('hiden');
        else !bet ? chip.classList.add('none') : chip.classList.remove('none');
        chip.firstElementChild.textContent = bet;
    })
    // console.log(chip);
};

// blackjack
function showHidenBlackjack(number, value){
    value ? document.getElementById('blackjackUser' + number).classList.remove('none') : document.getElementById('blackjackUser' + number).classList.add('none');
};

// показать очки дилера
function setDealerpoints(dealerpoints){
    const arrayP = document.getElementById('dealerpoints').querySelectorAll('p')
    arrayP.forEach((element, index) =>{
        if(!!dealerpoints[index]) element.textContent = dealerpoints[index].toUpperCase();
        let color = "#ffffff";
        if(dealerpoints[index] == 'bj') color = "#008000"
        if(dealerpoints[index] == 'bo') color = "#ff0000";
        element.style.color = color;
    });
};

// сесть за стол
function showHidenButtonSitTable(numberTable, show){
    if(show){
        document.getElementById('buttonSitTable'+numberTable).classList.remove('none');
    }
    else{
        document.getElementById('buttonSitTable'+numberTable).classList.add('none');
    }
}

// показать кнопки сделать ставку и покинуть стол
function showHidenButtonPlayer(numberTable, show){
    if(show){
        // показать кнопку сделать ставку
        if (!arrayChipsGame[numberTable - 1][0]) document.getElementById('buttonMakeBet'+numberTable).classList.remove('none');  
        else document.getElementById('buttonMakeBet'+numberTable).classList.add('none');  

        // покинуть стол
        document.getElementById('buttonPlayerBackTable'+numberTable).classList.remove('none');
    }
    else{
        document.getElementById('buttonMakeBet'+numberTable).classList.add('none');
        document.getElementById('buttonPlayerBackTable'+numberTable).classList.add('none');
    }
}

// покинуть стол
function showHidenButtonBackTable(show){
    if(show){
        document.getElementById('buttonBackTable').classList.remove('none');
    }
    else{
        document.getElementById('buttonBackTable').classList.add('none');
    }
}

// показать кнопки игры
function showHidenButtonGame(show){
    if(show){
        document.getElementById('leftButtons').classList.remove('none');
        document.getElementById('rightButtons').classList.remove('none');
    }
    else{
        document.getElementById('leftButtons').classList.add('none');
        document.getElementById('rightButtons').classList.add('none');
    }
}

// очки
function showHidenResults(number, show, point = '0'){
    if(show){
        document.getElementById(arrayResultsName[number]).firstElementChild.textContent = point;
        document.getElementById(arrayResultsName[number]).classList.remove('none');
    }
    else{
        document.getElementById(arrayResultsName[number]).classList.add('none');
    }
}

// активный стол
function activeTable(number, show){
    const element = document.getElementById('t'+number)
    if(show) {
        element.classList.add('activeTable');
        element.parentElement.style.borderColor = "#3B9001";
    }
    else {
        element.classList.remove('activeTable');
        element.parentElement.style.borderColor = "#235800";
    }
}

function showHidenButtonRepeatBids(show){
    show ? document.getElementById('buttonRepeatBids').classList.remove('none')
    : document.getElementById('buttonRepeatBids').classList.add('none');
}

// добавить строку в статистику
function addRowStatistick(numberMessage, str = ""){
    textarea.innerHTML += messagesResult[numberMessage] + str;
}

// получить статистику стола
function getStatictickTable(data){
    setDealerpoints(data.table.statistic.dealerpoints.split(','));
    document.getElementById('statistickDay').textContent = data.table.statistic.moneybackday;
    document.getElementById('statistickMonth').textContent = data.table.statistic.moneybackmonth;
    document.getElementById('statistickWeek').textContent = data.table.statistic.moneybackweek;
}











