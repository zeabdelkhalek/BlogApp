var counter = 0;

function changeBG() {
  var imgs = [
        'url(../imgs/photo1.jpg)',
        'url(../imgs/photo2.jpg)',
      'url(../imgs/photo7.jpg)',
      'url(../imgs/photo8.jpg)',
        'url(../imgs/photo3.jpg)',
        'url(../imgs/photo4.jpg)',
        'url(../imgs/photo5.jpg)',

        'url(../imgs/photo.jpg)'
      ];

  if (counter === imgs.length) {
    counter = 0;
  }
  document.body.style.backgroundImage = imgs[counter];

  counter++;
}

setInterval(changeBG, 5500);
