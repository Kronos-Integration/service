
import StandaloneServiceProvider from "../src/standalone-service-provider.mjs";


const sp = new StandaloneServiceProvider();

sp.start().then(()=> {
    sp.endpoints.log.addConnection(sp.services.logger.endpoints.log);
    console.log(`e ${sp.endpoints.log}`);
    sp.info('started');
});
