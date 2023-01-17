/*
    Hi, here's your scripts file. You can add your custom JS here and take advantage of the power of jQuery.

    If you need help, you can always check out the documentation at http://docs.jquery.com/ or the jQuery forum at http://forum.jquery.com/
*/

const store = new Store();

$(document).ready(function () {
  if (!store.get("lang")) {
    store.set("lang", "English");
  }

  const wordreference = "";
  //let wordreference = "https://wordreference.com/";
  //switch (store.get("lang")) {
  //  case "Italiano":
  //    wordreference += "definizione/";
  //    break;
  //  case "English":
  //    wordreference += "definition/";
  //    break;
  //}

  const languages = [/*"Italiano", */ "English"];
  $(function () {
    languages.forEach((lang) => {
      $("#languages").append(`<option value="${lang}">${lang}</option>`);
    });

    $("#languages").val(store.get("lang"));
  });

  $("#languages").on("change", function () {
    const lang = $("#languages").val();
    store.set("lang", lang);
  });

  $("#word-to-search").on("focus", function () {
    $(this).select();
    $(this).next().hide();
  });
  $("#word-to-search").on("blur", function () {
    if (!$(this).val() || !$(this).val().trim()) {
      $(this).val("");
      $(this).next().show();
    }
  });
  $("#word-to-search")
    .next()
    .on("click", function () {
      $(this).prev().focus();
    });
  $("#word-to-search").focus();
  $("#word-to-search").on("keyup", function (e) {
    if (e.keyCode === 13) {
      const word = $("#word-to-search").val();
      if (word) {
        const lang = store.get("lang");

        const body = {
          word: word,
          lang: lang,
        };

        fetch("/api/word", {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then(handleSuccess)
          .catch(handleError);

        function handleSuccess(data) {
          const parser = new DOMParser();
          const html = parser.parseFromString(data.html, "text/html");

          const dicts = [];

          // select all ordered lists before every span.rh_empos
          const labels = html.querySelectorAll("div#otherDicts span.rh_empos");
          labels.forEach((label) => {
            let ol = label.nextElementSibling;

            if (ol) {
              while (ol.tagName !== "OL") {
                ol = ol.nextElementSibling;
              }

              // make a readable list of ol list items
              const content = [];
              ol.querySelectorAll("li").forEach((li) => {
                // make a readable element
                const element = {};

                let definition = li.querySelector(".rh_def");
                if (!definition) {
                  return;
                }
                // cloning the node to avoid changing the original one
                definition = definition.cloneNode(true);
                // removing useless item
                definition.querySelectorAll("span").forEach((span) => {
                  if (!span.closest("ul")) {
                    span.remove();
                  }
                });

                let more = definition.querySelector("ul");
                if (more) {
                  element.definition = {};
                  element.definition.isList = true;
                  element.definition.more = [];

                  more = more.cloneNode(true);
                  const moreDefinitions = more.querySelectorAll("li .rh_sdef");
                  moreDefinitions.forEach((moreDefinition) => {
                    const def = {};
                    def.label = "";
                    def.examples = [];

                    // cloning the node to avoid changing the original one
                    moreDefinition = moreDefinition.cloneNode(true);

                    // take examples if present
                    let moreExamples =
                      moreDefinition.querySelectorAll(".rh_ex");
                    if (moreExamples) {
                      moreExamples.forEach((moreExample) => {
                        // cloning the node to avoid changing the original one
                        moreExample = moreExample.cloneNode(true);
                        // removing useless item
                        moreExample.querySelectorAll("span").forEach((span) => {
                          span.remove();
                        });
                        moreExample = moreExample.innerHTML;
                        def.examples.push(moreExample);
                      });
                    }

                    // removing useless item
                    moreDefinition.querySelectorAll("span").forEach((span) => {
                      span.remove();
                    });
                    def.label = moreDefinition.innerHTML;
                    element.definition.more.push(def);
                  });

                  // removing useless item
                  definition.querySelectorAll("ul").forEach((ul) => {
                    ul.remove();
                  });
                  element.definition.label = definition.innerHTML;
                } else {
                  // changing definition from being a node to a string
                  element.definition = definition.innerHTML;

                  let example = li.querySelector(".rh_ex");
                  if (example) {
                    // cloning the node to avoid changing the original one
                    example = example.cloneNode(true);
                    // removing useless item
                    example.querySelectorAll("span").forEach((span) => {
                      span.remove();
                    });
                    // changing example from being a node to a string
                    example = example.innerHTML;
                  }

                  element.example = example;
                }

                content.push(element);
              });

              dicts.push({
                label: label.innerHTML,
                content: content,
              });
            }
          });

          // iterate all and remove all start/end spaces and html tags like <strong> and </strong>
          // and put https://wordreference.com/definition/ in front of the link href
          const tags = [
            "<strong>",
            "</strong>",
            "<b>",
            "</b>",
            "[<i>no obj</i>] ",
            "&nbsp;&nbsp",
            "[ <i>~&nbsp;</i>&nbsp;obj] ",
            "&nbsp;",
            "<var>",
            "</var>",
            "[<i>no obj</i>]"
          ];
          dicts.forEach((dict) => {
            dict.label = dict.label.trim();
            tags.forEach((tag) => {
              dict.label = dict.label.replace(tag, "");
            });
            if (dict.label.includes('<a href="')) {
              dict.label = dict.label.replace(
                '<a href="',
                '<a class="reference-link" href="' + wordreference
              );
            }
            dict.content.forEach((content) => {
              if (content.definition.isList) {
                content.definition.label = content.definition.label.trim();
                tags.forEach((tag) => {
                  content.definition.label = content.definition.label.replace(
                    tag,
                    ""
                  );
                });
                content.definition.more.forEach((more) => {
                  more.label = more.label.trim();
                  tags.forEach((tag) => {
                    more.label = more.label.replace(tag, "");
                  });
                  if (more.label.includes('<a href="')) {
                    more.label = more.label.replace(
                      '<a href="',
                      '<a class="reference-link" href="' + wordreference
                    );
                  }
                  more.examples.forEach((example, index) => {
                    example = example.trim();
                    tags.forEach((tag) => {
                      example = example.replace(tag, "");
                    });
                    if (example.includes('<a href="')) {
                      example = example.replace(
                        '<a href="',
                        '<a class="reference-link" href="' + wordreference
                      );
                    }
                    more.examples[index] = example;
                  });
                });
              } else {
                content.definition = content.definition.trim();
                tags.forEach((tag) => {
                  content.definition = content.definition.replace(tag, "");
                });
                if (content.definition.includes('<a href="')) {
                  content.definition = content.definition.replace(
                    '<a href="',
                    '<a class="reference-link" href="' + wordreference
                  );
                }
              }
              if (content.example) {
                content.example = content.example.trim();
                tags.forEach((tag) => {
                  content.example = content.example.replace(tag, "");
                });
                if (content.example.includes('<a href="')) {
                  content.example = content.example.replace(
                    '<a href="',
                    '<a class="reference-link" href="' + wordreference
                  );
                }
              }
            });
          });

          if (dicts.length == 0) {
            handleError();
            return;
          }

          const wordReference = {
            word: word,
            references: dicts,
            audio: "",
          };

          const audio = data.html.match(/\/audio\/en\/us\/us\/en[0-9]+[.]mp3/g);
          if (audio) {
            wordReference.audio = "https://wordreference.com" + audio[0];
          }

          const dictParser = new DictParser(wordReference);
          const dictHtml = dictParser.html();
          $("#search-content").html("");
          $("#search-content").append(dictHtml);
        }

        async function handleError(err) {
          $("#word-to-search").addClass("bg-error");
          await wait(1500);
          $("#word-to-search").removeClass("bg-error");
        }
      }
    }
  });
});
