const express = require("express");
const app = express();
const http = require("http");
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const httpServer = http.createServer(app);
let token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIyMDIzLTEwLTI3IiwiZXhwIjoiMjAyMy0xMS0yNiIsInVzZXJfaWQiOiIyMyIsInVzZXJfbmFtZSI6ImRlbW8iLCJhZG1pbiI6ZmFsc2UsIm5hbWUiOiIgIiwidXNlcl9hZ2VudCI6IlBvc3RtYW5SdW50aW1lXC83LjM0LjAifQ.73zoUH3dG-gyV1MJ2eqF7KjDWEpd3mnXPPmwS-Cd2Oo";

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

// const axios = require('axios');

// const options = {
//   method: 'GET',
//   url: 'https://forecast9.p.rapidapi.com/rapidapi/forecast/Berlin/hourly/',
//   headers: {
//     'X-RapidAPI-Key': '0dd87ed2f0msh411a2271a26db2ep135c0ajsnf7afccd03736',
//     'X-RapidAPI-Host': 'forecast9.p.rapidapi.com'
//   }
// };

// try {
// 	const response = axios.request(options);
// 	console.log(response.data);
// } catch (error) {
// 	console.error(error);
// }
httpServer.listen(process.env.PORT || port, () => {
  console.log("HTTP Server running on port " + port);
});

async function login(token) {
  let newToken = null;

  await fetch("https://spaas.tecomon.net/API/JSON/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      UID: ["FF.3C6105DDB834"],
      FCN: [["FU.portal_login"]],
      FPL: [[["jwt"]]],
      FPD: [[[[[token]]]]],
    }),
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.FPD[0][0][0][0][0] !== false) {
        newToken = json.FPD[0][0][0][0][0];
      } else {
        throw new Error("Invalid token");
      }
    });

  return newToken;
}

/* 
  Get device data
  http://localhost:3000/devicedata?uid=FF.8CAAB542E501
*/

app.get("/devicedata", async (req, res) => {
  try {
    // Login to get new token
    token = await login(token);

    await fetch("https://spaas.tecomon.net/API/JSON/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        UID: [req.query.uid],
        FCN: [["FU.effi_data"]],
        FPL: [[["limit"]]],
        FPD: [[[[[req.query.count]]]]],
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        res.status(200).json(json);
        console.log(JSON.stringify(json));
      });
  } catch (err) {
    res.status(500).end();
    console.log(err);
  }
});

app.get("/multiSensorData", async (req, res) => {
  const UID = "00.00000413D167";
  try {
    // Login to get new token
    token = await login(token);

    await fetch("https://spaas.tecomon.net/API/JSON/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        UID: [UID],
        FCN: [["FU.effi_data"]],
        FPL: [[["limit"]]],
        FPD: [[[[[req.query.count ? req.query.count : "2"]]]]],
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        // res.status(200).json(json);

        // Define an array of property names to exclude
        const propertiesToExclude = ["FCN", "FPL"];

        // Create a new object without the excluded properties
        const modifiedObject = Object.fromEntries(
          Object.entries(json).filter(
            ([key, _]) => !propertiesToExclude.includes(key)
          )
        );

        // Convert the modified object to a JSON string
        const modifiedJsonString = JSON.stringify(modifiedObject);

        console.log(modifiedJsonString);
        const jsonObj = JSON.parse(modifiedJsonString);
        const FPD = jsonObj.FPD[0][0];
        const dateTime = FPD[0];
        const temperature = FPD[1];
        const brightness = FPD[3];
        const persons = req.query.persons ? Number(req.query.persons) + 1: 1;
        console.log(req.query.persons);
        const customJSON = {dateTime: dateTime, temperature: temperature, brightness: brightness, persons: persons};
        console.log(FPD);
        res.status(200).json(customJSON);

        // const jsonText = JSON.stringify(json);
        // console.log(jsonText);
      });
  } catch (err) {
    res.status(500).end();
    console.log(err);
  }
});

app.get("/", async (req, res) => {
  res.status(200).send("This is the Arena 2036 service 👋");
});
