import { Plugin, Server, ServerRegisterOptions, Request, ResponseToolkit, RouteOptions } from "hapi";
import Controller, { PathHandler, RouteMapping, Route } from "api/controllers/Controller";
import { DecodedToken } from "./token";
import * as assert from "assert";
import * as Joi from "joi";

// Controladores carregados
import TagController from "api/controllers/TagController";
import UserController from "api/controllers/UserController";
import RoleController from "api/controllers/RoleController";
import TaskController from "api/controllers/TaskController";
import WorkController from "api/controllers/WorkController";
import ProjectController from "api/controllers/ProjectController";
import VersionController from "api/controllers/VersionController";
import AuthController from "api/controllers/AuthController";

/**
 * Encapsula os parâmetros de ambos os tipos (url e payload) no mesmo objeto antes de passar para o controlador
 * @todo Tratar parâmetros de query
 */
function encapsulateParams(handler: PathHandler, request: Request, h: ResponseToolkit) {
    let allParams = Object.assign({}, request.payload, request.params);
    return handler(allParams, h, request);
}

/**
 * Registra as rotas do controlador no servidor
 */
function registerController(server: Server, controller: Controller) {
    let regex = /^(.+)(Controller)$/;
    let controllerName = controller.constructor.name;
    console.log("Registrando controlador: " + controllerName);
    for (let method in controller.routes) {
        for (let path in controller.routes[method]) {
            // Objeto da rota
            let route: Route = controller.routes[method][path];
            // Opções de validação e autenticação
            let options: RouteOptions = {
                validate: {
                    params: route.paramsValidator,
                    payload: route.payloadValidator
                },
                tags: ["api", controllerName.replace(regex, "$1 $2")],
                auth: route.auth != null ? route.auth : { mode: "required", strategy: "jwt" }
            };
            // Função de tratamento
            let handler: PathHandler = encapsulateParams.bind(undefined, route.handler);
            server.route({ method, path, handler, options });
        }
    }
}

/**
 * Valid a token JWT durante a autenticação
 */
function validate(token: DecodedToken, request: Request, h: ResponseToolkit) {
    console.log(request);
    return {
        isValid: true,
        credentials: token
    };
}

// Define o plugin do Hapi
export default {
    name: "Tasker API",
    version: "1.0",

    register: async function(server: Server, serverOpts: ServerRegisterOptions) {
        console.log("Registrando o hapi-auth-jwt2...");
        await server.register(require("hapi-auth-jwt2"));
        server.auth.strategy("jwt", "jwt", {
            key: process.env.SECRET_KEY,
            validate: validate
        });
        console.log("Registrando o hapi-swagger...");
        const swaggerOptions = {
            grouping: "tags",
            sortEndpoints: "method",
            expanded: "none",
            jsonEditor: true,
            info: {
                title: this.name + " Documentation",
                description: "An API made with Hapi.js - https://github.com/kukiric/tasker",
                version: this.version
            },
            securityDefinitions: {
                jwt: {
                    type: "apiKey",
                    name: "Authorization",
                    in: "header"
                }
            }
        };
        await server.register([
            { plugin: require("vision"), once: true },
            { plugin: require("inert"), once: true },
            { plugin: require("hapi-swagger"), options: swaggerOptions }
        ]);
        console.log("Registrando rotas da aplicação...");
        registerController(server, new TagController());
        registerController(server, new UserController());
        registerController(server, new RoleController());
        registerController(server, new WorkController());
        registerController(server, new TaskController());
        registerController(server, new ProjectController());
        registerController(server, new VersionController());
        registerController(server, new AuthController());
        console.log("Finalizado registro da aplicação!");
    }
};
