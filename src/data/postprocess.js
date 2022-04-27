import * as DenoModule from "https://deno.land/std@0.135.0/node/module.ts";
//import * as DenoMod from "https://deno.land/std/path/mod.ts";
// import { join } from "https://deno.land/std/path/mod.ts";
//import * as DenoBuffer from "https://deno.land/std/io/buffer.ts";
// import { BufReader } from "https://deno.land/std/io/buffer.ts";
//import { parse } from "https://deno.land/std/encoding/csv.ts";
import { writeCSV, removeFile } from "https://deno.land/x/flat@0.0.15/mod.ts";

const UID_ISO_FIPS_LookUp_Table = "UID_ISO_FIPS_LookUp_Table.csv";

const require = DenoModule.createRequire(import.meta.url);
const fs = require("fs");
const csv = require("csvtojson");
const { Parser } = require("json2csv");
const _ = require("lodash");
const countries = require("i18n-iso-countries");

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
//const countryArr = countries.getNames("en", {select: "official"})
(async () =>{
    //load ISO_FIPS_Lookup as JSON 
    const isoLookupTemp = await csv().fromFile(UID_ISO_FIPS_LookUp_Table);
    // remove dupes and non-countries in isoLookup so that we are left only with countries
    const isoLookup = [];
    await isoLookupTemp.forEach(object => {
        if(object.Province_State===""&&object.iso3!==""){
            isoLookup.push(object);
        }
    });
    // fs.writeFileSync("logIsoLookup.json",JSON.stringify(isoLookup));
    // load jhu data
    const jhu = await csv().fromFile("jhu.csv");
    //console.log(jhu);
    
    const countryRegionArr=[];
    // filter out duplicate countries
    const jhuTemp = [];
    await jhu.forEach(function(object,index) {
        //console.log(object);
        //console.log(JSON.stringify(object.Country_Region));          
            if(countries.getAlpha3Code(object.Country_Region,"en")){
                if(countryRegionArr.includes(object.Country_Region)){
                    //do nothing
                }else{ 
                    countryRegionArr.push(object.Country_Region);
                    let i = 1;
                    if(index<jhu.length-1){
                        
                        while(object.Country_Region===jhu[index+i].Country_Region ){
                            // console.log(object.Country_Region);
                            object.Confirmed = `${(parseInt(object.Confirmed)+parseInt(jhu[index+i].Confirmed))}`;
                            object.Deaths = `${(parseInt(object.Deaths)+parseInt(jhu[index+i].Deaths))}`;
                            object.Case_Fatality_Ratio = `${(parseInt(object.Confirmed)/parseInt(object.Deaths))}`;
                            i++;
                        }

                        // console.log("Population:"+parseInt(isoLookup.Country_Region))
                        //object.Population = parseInt(uID_ISO_FIPS_LookUp_Table.Country_Region.Population)
                        //object.Incident_Rate = `${(parseInt(object.Confirmed)/parseInt(uID_ISO_FIPS_LookUp_Table.Population))}`
                        jhuTemp.push(object);
                    }
                }
            }
        });

// TODO: calc the incident rate and fatality ratio properly for locations with multiple provinces
// Get the Vaccine data to properly combine with the rest of the data

    //console.log(countryRegionArr);
    //console.log(jhuTemp);
    //fs.writeFileSync("log.json",JSON.stringify(jhuTemp));
    
    //load vaccine daily data
    const dailyVax = await csv().fromFile("vaccineDailyReport.csv");
    //console.log(dailyVax);
    
    // filter out duplicate countries
    const dailyVaxTemp=[];
    await dailyVax.forEach(object => {
        //console.log(object);
        //console.log(JSON.stringify(object.Country_Region));
        if(object.Province_State===""){
            if ( countryRegionArr.includes(object.Country_Region)){
                dailyVaxTemp.push(object);
            }
        }
    });
    
    
    //Filter jhu data to only what we are looking for
    // console.log(jhu)



    // edit the data
    //const jhuTemp = await new Parser({quote: "", fields: ["Country_Region","Confirmed","Deaths","Incident_Rate","Case_Fatality_Ratio"]}).parse(jhu);
    //console.log(jhuTemp);

    //const dailyVaxTemp = await new Parser({quote: "", fields: ["Country_Region","People_partially_vaccinated","People_fully_vaccinated"]}).parse(dailyVax);
    //console.log(dailyVaxTemp);

    // Combine the files using lodash
    const masterTemp1 = await _({}).merge(_(jhuTemp).groupBy("Country_Region"),_(dailyVaxTemp).groupBy("Country_Region"),_(isoLookup).groupBy("Country_Region")).values().flatten().value();
    
    //console.log(masterTemp1);
    //fs.writeFileSync("log.json",JSON.stringify(masterTemp1));
    //object.Incident_Rate = `${(parseInt(object.Confirmed)/parseInt(uID_ISO_FIPS_LookUp_Table.Population))}`
    const masterTemp2 = [];
    await masterTemp1.forEach(object => {
        if(object){
            object.Incident_Rate = `${(parseInt(object.Confirmed)/parseInt(object.Population))}`||{};
            masterTemp2.push(object);   
        }
    });


    const masterFile = await new Parser({quote: "", fields: ["Country_Region","Confirmed","Deaths","Incident_Rate","Case_Fatality_Ratio","People_partially_vaccinated","People_fully_vaccinated"]}).parse(masterTemp1);

    //console.log(masterFile)

    // remove old files to save space
    await removeFile("jhu.csv")
    await removeFile("vaccineDailyReport.csv")

    // save the data
    await writeCSV("masterFile.csv", masterFile);
    //await fs.writeFileSync("masterFile.csv", masterFile);


})();





// async function readCsvData() {
//     const path = join('.', 'jhu.csv');
//     const data = await Deno.open(path);
//     const bufreader = new BufReader(data);

//     const result = await parse(bufreader, {
//         country_region: true
//     })

//     Deno.close(data.rid);
//     console.log(result);
// }
// await readCsvData();