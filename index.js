const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

express()
  .use(express.json())
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => {
    // if variables are sent, render the page with the variables
    if (req.query.word && req.query.lang) {
      res.render("pages/index", {
        word: req.query.word,
        lang: req.query.lang,
      });

      // otherwise, render the page without variables
    } else {
      res.render("pages/index", {
        word: "",
        lang: "",
      });
    }
  })
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
  .get("/api/word/page", (req, res) => {
    // /api/word/page?word=word&lang=lang
    if (!req.query || !req.query.word || !req.query.lang) {
      handleError("Missing word or lang");
      return;
    }

    function handleError(err) {
      res.status(400).json({
        error: err,
      });
    }

    // otherwise, redirect to "/" and send a variable to the page
    res.redirect("/?word=" + req.query.word + "&lang=" + req.query.lang);
  })
  .get("*", (req, res) => {
    res.redirect("https://www.wordreference.com/definition/" + req.path);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
