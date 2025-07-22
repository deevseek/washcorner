"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("react-dom/client");
const react_query_1 = require("@tanstack/react-query");
const App_1 = __importDefault(require("./App"));
require("./index.css");
const queryClient_1 = require("./lib/queryClient");
(0, client_1.createRoot)(document.getElementById("root")).render(<react_query_1.QueryClientProvider client={queryClient_1.queryClient}>
    <App_1.default />
  </react_query_1.QueryClientProvider>);
