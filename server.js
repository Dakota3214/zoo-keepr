const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
// Parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// Parse incoming JSON data
app.use(express.json());
const { animals } = require("./data/animals.json");
const PORT = process.env.PORT || 3001;



// Filters clients search to find specific stats about animals
    function filterByQuery(query, animalsArray) {

        let personalityTraitsArr = [];
        // Note we saved animalsArray as filteredResults here: 
        let filteredResults = animalsArray;


        if (query.personalityTraits) {
            //Save personalityTraits as a dedicated array.
            // If personailityTraits is a string, place it into a new array and save.
            if (typeof query.personalityTraits === "string") {
                personalityTraitsArr = [query.personalityTraits];
            } else {
                personalityTraitsArr = query.personalityTraits;
            }
            // Loop through each trait in the personalityTraits array:
            personalityTraitsArr.forEach(trait => {
                // Check the trait against each animal in the filteredResults array.
                // Remember, it is initially a copy of the animalsArray,
                // but here we're updating it for each trait in the .forEach() loop.
                // For each trait being targeted by the filter, the filteredResults
                // array will then contain only the entries that contain the trait,
                // so at the end we'll have an array of animals that have every one 
                // of the traits when the .forEach() loop is finished.
                filteredResults = filteredResults.filter(
                    animal => animal.personalityTraits.indexOf(trait) !== -1
                );
                
            });
        };

        if (query.diet) {
            filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
        }
        if (query.species) {
            filteredResults = filteredResults.filter(animal => animal.species === query.species);
        }
        if (query.name) {
            filteredResults = filteredResults.filter(animal => animal.name === query.name);
        }
        //Return filtered results:
        return filteredResults;
    };

// Let's clients find animals by ID
    function findById(id, animalsArray) {
        const result = animalsArray.filter(animal => animal.id === id)[0];
        return result;
    };

// Creates new animal and stores that data into animals.json file
    function createNewAnimal(body, animalsArray) {
        console.log(body);
        // Our functions main code will go here
        const animal = body;
        animalsArray.push(animal);

        fs.writeFileSync(
            path.join(__dirname, "./data/animals.json"),
            JSON.stringify({ animals: animalsArray }, null, 2)
        );

        // Return finished code to post route for response
        return animal;
    }

// Gets array of animals 
    app.get("/api/animals", (req, res) => {
        let results = animals;
        if (req.query) {
            results = filterByQuery(req.query, results);
        }
        res.json(results);
    });

// Gets animal by ID from array
    app.get("/api/animals/:id", (req, res) => {
        const result = findById(req.params.id, animals);
        if (result) {
        res.json(result);
        } else {
            res.send(404);
        }
    });

// Turns incoming data(adding animals), server to client, into json format 
    app.post("/api/animals", (req, res) => {
        // req.body is where our incoming content will be
        req.body.id = animals.length.toString();

        // If any data in req.body is incorrect, send 404 error back
        if (!validateAnimal(req.body)) {
            res.status(400).send("The animal is not properly formatted.");
        } else {
            const animal = createNewAnimal(req.body, animals);
            res.json(animal)
        }
        
        // Add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals);


        res.json(req.body);
    });

// Validates to see if each key not only exists but also the right type of data
    function validateAnimal(animal) {
        if (!animal.name || typeof animal.name !== 'string') {
        return false;
        }
        if (!animal.species || typeof animal.species !== 'string') {
        return false;
        }
        if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
        }
        if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
        }
        return true;
    };

// Listens to PORT (3001) so we can communicate between server and client side
    app.listen(PORT, () => {
        console.log(`API server now on port ${PORT}!`);
    });