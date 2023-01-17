const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

express()
  .use(express.json())
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .post("/api/word", (req, res) => {
    if (!req.body || !req.body.word || !req.body.lang) {
      handleError("Missing word or lang");
      return;
    }

    function langToUrl(lang) {
      switch (lang) {
        case "English":
          return "https://www.wordreference.com/definition/";
        case "Italiano":
          return "https://www.wordreference.com/definizione/";
        default:
          return undefined;
      }
    }

    function handleSuccess(data) {
      res.status(200).json({
        html: data,
      });
    }

    function handleError(err) {
      res.status(400).json({
        error: err,
      });
    }

    let url = langToUrl(req.body.lang);
    if (!url) {
      handleError("Unknown language");
      return;
    }
    url += req.body.word;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
      .then((res) => res.text())
      .then(handleSuccess)
      .catch(handleError);
  })
  .get("*", (req, res) => {
    res.redirect("https://www.wordreference.com/definition/" + req.path);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
