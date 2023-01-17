/**
 *
 * @param {string | HTMLElement} element
 * @description Animate an element with this function passing the selector or the element itself and the animation name as a string (without the "animate__" prefix). It returns a Promise that resolves when the animation ends. See https://animate.style/ for more information.
 * @param {string} animation
 * @param {string} prefix
 * @returns {Promise<string>}
 */
const animateCSS = (element, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    /**
     * @type {HTMLElement}
     */
    let node;

    if (element instanceof HTMLElement) {
      node = element;
    } else {
      node = document.querySelector(element);
    }

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });
