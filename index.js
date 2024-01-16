const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const axios = require('axios');
const exphbs  = require('express-handlebars');

const app = express();

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "YOUR$UP3R$3CR3T",
  resave: true,
  saveUninitialized: true
}));

var whiteList = ["http://localhost:8000", "http://localhost:3000", "http://localhost:8080"];var corsOptionsDelegate = function (req, callback) {
 var corsOptions;
 if (whiteList.indexOf(req.header("Origin")) !== -1) {
   corsOptions = { origin: true };
 } else {
   corsOptions = { origin: false };
 }
 callback(null, corsOptions);
}

app.use(cors(corsOptionsDelegate));

const form = "<form method=\"post\" action=\"http://localhost:3000/addTeam\">"
  +"Name:<br>"
  +"  <input type=\"text\" name=\"name\" value=\"\">"
  +"  <br>"
  +"  Foundation:<br>"
  +"  <input type=\"text\" name=\"foundation\" value=\"\">"
  +"  <br><br>"
  +"  <input type=\"submit\" value=\"Submit\">"
  +"</form>";

app.listen(3000, function () {
    console.log("App listening on port 3000!");
});

app.get("/", cors(), function (req, res, next) {
    res.status(200).send("CORS enabled for this route.");
 })

app.get("/", function (req, res) {
    res.send("Hey, I am responding to your request!");
});

app.get("/categories", async (req, res) => {
  const response = await axios.get('https://wiki-ads.onrender.com/categories');
    res.json(response.data);
});

app.get("/subcategories", async (req, res) => {
  const response = await axios.get('https://wiki-ads.onrender.com/subcategories');
    res.json(response.data);
});

app.get('/ads', async (req, res) => {
  try {
    const categoryId = req.query.category;
    const subcategoryId = req.query.subcategory;

    if (categoryId) {
      // Make a GET request to another API with the categoryId
      const response = await axios.get(`https://wiki-ads.onrender.com/ads?category=${categoryId}`);

      // Get the category name from the response or another source
      const categoryName = response.data.categoryName || 'Unknown Category';
      console.log(categoryName);
      // Render the Handlebars template for ads with category
      res.render('adsWithCategory', { ads: response.data.ads, categoryName });
    } else if (subcategoryId) {
      // Make a GET request to another API with the subcategoryId
      const response = await axios.get(`https://wiki-ads.onrender.com/ads?subcategory=${subcategoryId}`);

      // Get the subcategory name from the response or another source
      const subcategoryName = response.data.subcategoryName || 'Unknown Subcategory';

      // Render the Handlebars template for ads with subcategory
      console.log('Response Data:', response.data);
      res.render('adsWithSubcategory', { ads: response.data.ads, subcategoryName });
    } else {
      return res.status(400).send('Missing category or subcategory parameter');
    }
  } catch (error) {
    console.error('Error making API request:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/categories/:id/subcategories', async (req, res) => {
  try {
    
    const categoryId = req.params.id;
    const response = await axios.get(`https://wiki-ads.onrender.com/categories/${categoryId}/subcategories`);

    res.json(response.data);
  } catch (error) {
    console.error('Error making API request:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/teams/:id", function (req, res) {
    if(teams[req.params.id] !== undefined){
      res.status(200).send(teams[req.params.id]);
    } else {
      res.status(404).send("Oops! 404: Team not found!");
    }
});

app.get("/addTeam", function (req, res) {
    res.status(200).send(form);
});

app.post("/addTeam", function (req, res) {
    res.status(200).send("You have posted a team of name: "+req.body.name+" and foundation: "+req.body.foundation);
});