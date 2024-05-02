import { DependencyContainer }  from "tsyringe";
import { IPostDBLoadMod }       from "@spt-aki/models/external/IPostDBLoadMod";
import { LogTextColor }         from "@spt-aki/models/spt/logging/LogTextColor";
import { ILogger }              from "@spt-aki/models/spt/utils/ILogger";
import { RagfairPriceService }  from "@spt-aki/services/RagfairPriceService";
import { CustomItemService }    from "@spt-aki/services/mod/CustomItemService";
import { DatabaseServer }       from "@spt-aki/servers/DatabaseServer";
import { ConfigServer }         from "@spt-aki/servers/ConfigServer";
import { JsonUtil }             from "@spt-aki/utils/JsonUtil";
import { HashUtil }             from "@spt-aki/utils/HashUtil";
import { API }                  from "../../DJCore/src/api";

import * as moduleItems         from "../ModuleItems/Weapons.json";
import * as moduleAmmo          from "../ModuleItems/Ammunition.json";
import * as weaponPresets       from "../ModuleItems/WeaponPresets.json";

const fs = require('fs');
const modName = "Additional Weapons Module";

class ModuleAdditionalWeapons implements IPostDBLoadMod
{
    private static apiDepCheck(): boolean 
    {
        const coreMod = "api.js";

        try { const coreApiPath = fs.readdirSync("./user/mods/DJCore/src").map(api => api.toLowerCase()); return coreApiPath.includes(coreMod); }
        catch { return false; }
    }

    /**
    * @param container
    */
    public postDBLoad(container: DependencyContainer): void 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const tables = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const hashUtil = container.resolve<HashUtil>("HashUtil");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const customItemService = container.resolve<CustomItemService>("CustomItemService");
        const ragfairPriceService = container.resolve<RagfairPriceService>("RagfairPriceService");
        
        if (!ModuleAdditionalWeapons.apiDepCheck()) { return logger.error(`[${modName}] Error, DJCore API is missing from the user/mods folder.\nPlease install correctly.`) }

		const coreAPI = container.resolve<API>("API");

        for (const weaponID in moduleItems.AdditionalWeapons)
        {
            const weaponConfig = moduleItems.AdditionalWeapons[weaponID]

            coreAPI.createItem(weaponConfig, customItemService, tables, jsonUtil, configServer, hashUtil, ragfairPriceService);
        }
        
        for (const ammoID in moduleAmmo.AdditionalAmmo)
        {
            const ammoConfig = moduleAmmo.AdditionalAmmo[ammoID]

            coreAPI.createItem(ammoConfig, customItemService, tables, jsonUtil, configServer, hashUtil, ragfairPriceService);
        }

        coreAPI.addPresets(weaponPresets.ItemPresets, tables)

        this.loadModuleBanner(logger);
    }

    private loadModuleBanner(logger: ILogger)
    {
        logger.log(
            `[DJCore] ----------------------------------------------------------------`,
            LogTextColor.CYAN
        );
        logger.log(
            `[DJCore]               ${modName} Loaded`,
            LogTextColor.CYAN
        );
        logger.log(
            `[DJCore] ----------------------------------------------------------------`,
            LogTextColor.CYAN
        );
    }
}

module.exports = { mod: new ModuleAdditionalWeapons() };