"use strict";

// Отправка запросов
// сесть за стол
function setTable(number){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=box.in&bid=${number}`);
    clearTimeout(timerMessageShow);
    startTimerAlert(1, 10000);
};

// покинуть стол
function unsetUserTable(number){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=box.out&bid=${number}`);
    //time = 0;
    arrayBetSet[number - 1] = 0;
    clearTimeout(timerMessageShow);
};
// покинуть столы
function unsetUserAllTable(){
    getData("https://damask.mycarnage.ru/carnagejack.php?cmd=boxes.out");
    //time = 0;
    arrayBetSet = [0, 0, 0, 0, 0];
    clearTimeout(timerMessageShow);
};

// Сделать ставку
function setBit(numberTable){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=bet&bet=${bet}&bid=${numberTable}`);
    // убрать кнопку сделать ставку
    document.getElementById('buttonMakeBet'+numberTable).classList.add('none');
    arrayBetSet[numberTable - 1] = arrayBets[+bet - 1];
    clearTimeout(timerMessageShow);
};

//double
function actionDouble(){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=action&aid=4&bid=${gameCurbox}`);
};
//split
function actionSplit(){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=action&aid=2&bid=${gameCurbox}`);
};
//stand
function actionStand(){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=action&aid=3&bid=${gameCurbox}`);
};
//hit
function actionHit(){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=action&aid=1&bid=${gameCurbox}`);
};
//surrender
function actionSurrender(){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=action&aid=6&bid=${gameCurbox}`);
};
// страховка
// insurance
function actionInsurance(){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=action&aid=5&bid=${gameCurbox}`);
};

// повторить ставки
function actionRepeatBids(){
    getData(`https://damask.mycarnage.ru/carnagejack.php?cmd=bets.repeat`);
    showHidenButtonRepeatBids(false);
}