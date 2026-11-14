const world = document.querySelector('#world');
const remixButton = document.querySelector('#remix');
const blocks = [...world.querySelectorAll('.block')];
const colors = ['#72c989', '#a5e477', '#58b987', '#d2e87a', '#7dd39a', '#66bd83', '#80c6d6', '#e4ad68'];

function remixBlocks() {
  blocks.forEach((block) => {
    block.style.setProperty('--block', colors[Math.floor(Math.random() * colors.length)]);
  });
}

blocks.forEach((block) => {
  block.setAttribute('role', 'button');
  block.setAttribute('tabindex', '0');
  block.setAttribute('aria-label', 'Change block color');
  block.addEventListener('click', () => {
    block.style.setProperty('--block', colors[Math.floor(Math.random() * colors.length)]);
  });
  block.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      block.click();
    }
  });
});

remixButton.addEventListener('click', remixBlocks);
document.querySelector('#year').textContent = new Date().getFullYear();
