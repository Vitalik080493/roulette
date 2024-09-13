"use strict"
const map = document.querySelector('.map');

let div = document.createElement('div'); // создать тег div
div.className = "betweenHorizont_0-3 horizont h1-t h0-l";
//div.setAttribute('onclick', setChipBlock(this, 'betweenHorizont_6-9'));
div.innerHTML = "<div class='block_chip none'><p></p></div>";
map.append(div); // вставляем тег div в тег body