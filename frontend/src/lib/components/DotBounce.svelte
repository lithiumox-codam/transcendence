<script>
  import { onMount } from 'svelte';

  let ball;
  let container;
  let x;
  let y;
  let dx;
  let dy;

  onMount(() => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const ballWidth = ball.offsetWidth;
    const ballHeight = ball.offsetHeight;

    x = (containerWidth - ballWidth) / 2;
    y = (containerHeight - ballHeight) / 2;

    dx = Math.max(0.5, Math.min((Math.random() * 4 - 2) || 1, 1.5));
    dy = Math.max(0.5, Math.min((Math.random() * 4 - 2) || 1, 1.5));

    function animate() {
      x += dx;
      y += dy;

      if (x > containerWidth - ballWidth) {
        x = containerWidth - ballWidth;
        dx *= -1;
      } else if (x < 0) {
        x = 0;
        dx *= -1;
      }

      if (y > containerHeight - ballHeight) {
        y = containerHeight - ballHeight;
        dy *= -1;
      } else if (y < 0) {
        y = 0;
        dy *= -1;
      }

      ball.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(animate);
    }

    animate();
  });
</script>

<div bind:this={container} class="container">
  <div bind:this={ball} class="ball"></div>
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    height: 2.3rem;
  }

  .ball {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: hsl(var(--background) / 0.1);
    border-radius: 50%;
    background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2));
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
</style>
