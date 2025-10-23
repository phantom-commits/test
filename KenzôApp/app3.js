const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  menu.classList.toggle('active');
});

Array.from(document.querySelectorAll('.tabs')).forEach((tab_container, TabID) => {
    const registers = tab_container.querySelector('.tab-registers');
    const bodies = tab_container.querySelector('.tab-bodies');
  
    Array.from(registers.children).forEach((el, i) => {
      el.setAttribute('aria-controls', `${TabID}_${i}`)
      bodies.children[i]?.setAttribute('id', `${TabID}_${i}`)
    
      el.addEventListener('click', (ev) => {
        let activeRegister = registers.querySelector('.active-tab');
        activeRegister.classList.remove('active-tab')
        activeRegister = el;
        activeRegister.classList.add('active-tab')
        changeBody(registers, bodies, activeRegister)
      })
  })
})


function changeBody(registers, bodies, activeRegister) {
    Array.from(registers.children).forEach((el, i) => {
        const body = bodies.children[i];
        if (body) {
            if (el === activeRegister) {
                body.classList.add('active');
            } else {
                body.classList.remove('active');
            }
        }
        el.setAttribute('aria-expanded', el === activeRegister ? 'true' : 'false');
    });
}
