import ReactDOM from "react-dom";
import dotenv from "dotenv";

dotenv.config();

import { QuerySpecimen } from "./QuerySpecimen";


console.log(process.env.API_URR, 'aoeu');
const main = document.getElementById("main");
ReactDOM.render(<QuerySpecimen />, main);
