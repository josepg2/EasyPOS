/* eslint-disable */
const ThermalPrinter = require("node-thermal-printer").printer;
const Types = require("node-thermal-printer").types;
const Printer = require("printer");
async function example () {
    let printer = new ThermalPrinter({
      type: Types.EPSON,  // 'star' or 'epson'
      interface: "printer:POS-58-Series",                   // Number of characters in one line - default: 48
      driver: Printer,
      characterSet: 'SLOVENIA',          // Character set - default: SLOVENIA
      removeSpecialCharacters: false,    // Removes special characters - default: false
      lineCharacter: "-",                // Use custom character for drawing lines - default: -
    });
  
    let isConnected = await printer.isPrinterConnected();
    console.log("Printer connected:", isConnected);
    console.log(Printer.getPrinters());
  
    printer.alignCenter();
    //await printer.printImage('./assets/olaii-logo-black-small.png');
  
    printer.alignLeft();
    printer.newLine();
    printer.println("Hello World!");
    printer.drawLine();

    try {
        await printer.execute();
        console.log("Print success.");
      } catch (error) {
        console.error("Print error:", error);
      }
    }
    //
    //
//example();

const path = require('path');
const knex = require('knex')({
    client: "sqlite3",
    connection: {
        filename: path.join('C:\\Users\\id4ge\\work\\EasyPOS', 'posbillingsystem.sqlite').toString()
        //filename: path.join('C:\\Users\\George_Joseph02', "posbillingsystem.sqlite").toString()
        //filename : path.join(dataPath, "testdatabase.sqlite").toString()
    },
    useNullAsDefault: true
});
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

createTables();

function createTables() {

    knex.schema.hasTable('storeid')
        .then(function (exists) {
            if (!exists) {
                return knex.schema.createTable('storeid', function (table) {
                    table.increments();
                    table.string("key");
                    table.integer("prodid");
                    table.integer("billid");
                    table.integer("purchaseid");
                    table.integer("offerid");
                    table.timestamp("updated_at").defaultTo(knex.fn.now());
                });
            }
        })
        .then((response) => {
            if (response) {
                return knex('storeid')
                    .insert({
                        key: "storeidkey"
                    })
            }
        })
        .catch((error) => {
            console.log(error);
        });

    knex.schema.hasTable('inventory')
        .then(function (exists) {
            if (!exists) {
                return knex.schema.createTable('inventory', function (table) {
                    table.increments("id");
                    table.string("prodid", 5);
                    table.string("prodname");
                    table.string("proddisc");
                    table.boolean("isremoved");
                    table.integer("stock");
                    table.float("unitprice", 9, 2);
                    table.integer("category");
                    table.integer("tax");
                    table.integer("hasoff");
                    table.string("offtype");
                    table.float("offvalue", 9, 2);
                    table.string("updated_by");
                    table.timestamps(false, true);
                    table.unique("prodid");
                });
            }
        })
        .then(response => {
            if (response) {
                return knex('inventory')
                    .insert({
                        "prodid": "1"
                    })
            }
        })
        .then(response => {
            if (response) {
                return knex('inventory')
                    .where("prodid", "1")
                    .select("id")
            }
        })
        .then(response => {
            if (response) {
                return knex('storeid')
                    .where("key", "storeidkey")
                    .update("prodid", response[0].id)
            }
        })
        .then(response => {
            if (response) {
                return knex('inventory')
                    .where("prodid", "1")
                    .del()
            }
        })
        .catch(error => {
            console.log(error);
        })

    knex.schema.hasTable('users').then(function (exists) {
        if (!exists) {
            return knex.schema.createTable('users', function (table) {
                table.increments();
                table.string("username");
                table.string("password");
                table.boolean("isadmin");
                table.boolean("canedit");
                table.boolean('active');
                table.timestamp("created_at").defaultTo(knex.fn.now());
                table.unique('username');
            });
        }
    })
    .then(response => {
        if(response) {
            return knex('users')
                .insert([{
                    username : 'admin',
                    password : 'admin',
                    isadmin  : true,
                    canedit  : true,
                    active : true
                }])
        }
    })
    .catch(error => {
        console.log(error);
    })

    knex.schema.hasTable('sales').then(function (exists) {
        if (!exists) {
            return knex.schema.createTable('sales', function (table) {
                    table.increments('id');
                    table.string("billid");
                    table.float("tax");
                    table.float("offvalue");
                    table.float("total");
                    table.string("created_by");
                    table.timestamp("created_at").defaultTo(knex.fn.now());
                })
                .then(response => {
                    if (response) {
                        return knex('sales')
                            .insert({
                                "billid": "1"
                            })
                    }
                })
                .then(response => {
                    if (response) {
                        return knex('sales')
                            .where("billid", "1")
                            .select("id")
                    }
                })
                .then(response => {
                    if (response) {
                        return knex('storeid')
                            .where("key", "storeidkey")
                            .update("billid", response[0].id)
                    }
                })
                .then(response => {
                    if (response) {
                        return knex('sales')
                            .where("billid", "1")
                            .del()
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        }
    });

    knex.schema.hasTable('salesitems')
        .then(function (exists) {
            if (!exists) {
                return knex.schema.createTable('salesitems', function (table) {
                    table.increments();
                    table.string("billid");
                    table.string("prodid");
                    table.string("prodname");
                    table.integer("quantity");
                    table.float("unitprice");
                    table.float("tax");
                    table.float("offvalue");
                })
            }
        })

    knex.schema.hasTable('purchase')
        .then(function (exists) {
            if(!exists){
                return knex.schema.createTable('purchase', function (table){
                    table.increments('id');
                    table.string('purchaseid');
                    table.float('total');
                    table.float('discount');
                    table.string("created_by");
                    table.timestamp("created_at").defaultTo(knex.fn.now());
                    table.unique('purchaseid');
                })
            }
        })
        .then(response => {
            if (response) {
                return knex('purchase')
                    .insert({
                        "purchaseid": "1"
                    })
            }
        })
        .then(response => {
            if (response) {
                return knex('purchase')
                        .where("purchaseid", "1")
                        .select("id")
            }
        })
        .then(response => {
            if (response) {
                return knex('storeid')
                    .where("key", "storeidkey")
                    .update("purchaseid", response[0].id)
            }
        })
        .then(response => {
            if (response) {
                return knex('purchase')
                    .where("purchaseid", "1")
                    .del()
            }
        })
        .catch(error => {
            console.log(error);
        })

    knex.schema.hasTable('purchaseitems')
        .then(function (exists) {
            if (!exists) {
                return knex.schema.createTable('purchaseitems', function (table) {
                    table.increments();
                    table.string("purchaseid");
                    table.string("prodid");
                    table.integer("quantity");
                    table.float("unitprice");
                })
            }
        })

    knex.schema.hasTable('taxes')
        .then(function (exists) {
            if (!exists) {
                return knex.schema.createTable('taxes', function (table) {
                    table.increments('taxid');
                    table.string("taxname");
                    table.integer("taxvalue");
                    table.timestamp("updated_at").defaultTo(knex.fn.now());
                    table.unique("taxname");
                });
            }
        })
        .then(response => {
            if(response){
                return knex('taxes')
                        .insert([{
                            taxname : 'None',
                            taxvalue: 0
                        }])
            }
        })
        .catch(error => {
            console.log(error);
        })

    knex.schema.hasTable('category')
        .then(function (exists) {
            if (!exists) {
                return knex.schema.createTable('category', function (table) {
                    table.increments('id');
                    table.string("name");
                    table.integer("count");
                    table.timestamp("updated_at").defaultTo(knex.fn.now());
                    table.unique("name");
                });
            }
        })
        .then(response => {
            if(response) {
                return knex('category')
                           .insert([{
                                name : 'None',
                                count: 0
                           }])
            }
        })
        .catch(error => {
            console.log(error);
        })

    knex.schema.hasTable('offers')
        .then(function (exists) {
            if (!exists) {
                return knex.schema.createTable('offers', function (table) {
                    table.increments();
                    table.integer('offerid');
                    table.string("name");
                    table.string('type');
                    table.integer('value');
                    table.unique('name');
                });
            }
        })
        .then(response => {
            if(response){
                return knex('offers')
                        .insert([{
                            offerid : 0,
                            name : 'None',
                            type : 'rupee',
                            value : 0
                        },
                        {
                            offerid : 1,
                            name : 'Custom',
                            type : 'rupee',
                            value : 0
                        }
                    ])
            }
        })
        .then(response => {
            return knex('storeid')
                    .where("key", "storeidkey")
                    .update("offerid", 1)
        })
        .catch(error => {
            console.log(error);
        })

}

app.listen(3000, () => console.log('Example app listening on port 3000!'))