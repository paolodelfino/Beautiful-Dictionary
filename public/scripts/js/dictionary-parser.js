class DictParser {
  /**
   *
   * @param {object} data
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * @returns {string}
   */
  html() {
    const container = document.createElement("div");

    const sound = document.createElement("audio");
    sound.setAttribute("src", this.data.audio);

    const word = document.createElement("h1");
    word.innerHTML = this.data.word;

    if (this.data.audio) {
      word.innerHTML += " 🔊";
      $(word).on("click", () => {
        sound.play();
      });
    } else {
      word.innerHTML += " 🔇";
    }

    container.appendChild(sound);
    container.appendChild(word);

    this.data.references.forEach((reference) => {
      const label = document.createElement("h3");
      label.innerHTML = reference.label;

      container.appendChild(label);

      reference.content.forEach((def) => {
        if (typeof def == "object" && def.definition.isList) {
          def = def.definition;

          if (def.label) {
            const label = document.createElement("h5");
            label.innerHTML = def.label;
            container.appendChild(label);
          }

          const list = document.createElement("ol");
          def.more.forEach((item) => {
            const li = document.createElement("li");

            const label = document.createElement("h5");
            label.innerHTML = item.label;

            li.appendChild(label);

            item.examples.forEach((example) => {
              const exampleLabel = document.createElement("h6");
              exampleLabel.innerHTML = example;

              li.appendChild(exampleLabel);
            });

            list.appendChild(li);
          });

          container.appendChild(list);
        } else {
          const definition = document.createElement("h5");
          definition.innerHTML = def.definition;

          const example = document.createElement("h6");
          example.innerHTML = def.example;

          container.appendChild(definition);
          container.appendChild(example);
        }

        const br = document.createElement("br");
        container.appendChild(br);
      });
    });

    return container;
  }
}
