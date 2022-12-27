"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;
const Shikimori = require("shikimori-api-node");
const fs = require("fs");
const consts_1 = require("./consts");
class Core {
    get appConfig() {
        if (!this._appConfig)
            this._appConfig = this.readAppConfig();
        return this._appConfig;
    }
    set appConfig(config) {
        this._appConfig = Object.assign(Object.assign({}, this._appConfig), config);
    }
    connectShikimori() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.shiki = new Shikimori();
            const config = this.appConfig;
            this.shiki.auth.credentials = Object.assign({}, config.login);
            let auth;
            if ((_a = config === null || config === void 0 ? void 0 : config.login) === null || _a === void 0 ? void 0 : _a.refreshtoken) {
                auth = yield this.shiki.auth.refreshToken();
            }
            if (!auth.accesstoken) {
                auth = yield this.shiki.auth.login(Object.assign({}, config.login));
            }
            this.appConfig.login = auth;
            this.saveAppConfig();
            return auth;
        });
    }
    saveAppConfig() {
        fs.writeFileSync(`${__dirname}/${consts_1.CONFIG_FILE_NAME}`, JSON.stringify(this._appConfig));
    }
    readAppConfig() {
        const raw = fs.readFileSync(`${__dirname}/${consts_1.CONFIG_FILE_NAME}`, {
            encoding: 'utf8',
        });
        return raw ? JSON.parse(raw) : {};
    }
}
exports.Core = Core;
//# sourceMappingURL=core.js.map