import SensorsController from '../../src/subsystems/sensorsController.js';
//import { isPrivateIdentifier } from '../../../node_modules/typescript/lib/typescript.js'
export default class YourSensorsController extends SensorsController {
    constructor() {
        super(...arguments);
        //Add additional attributes here
        this.target = null;
        this.passiveScans = [];
        this.activeScans = [];
        this.passiveCooldown = 0;
        this.activeCooldown = 0;
        this.defenseTarget = null;
        this.coolDownTick = () => {
            this.activeCooldown--;
            this.passiveCooldown--;
        };
    }
    sensorsUpdate(activeScan, passiveScan) {
        if (this.passiveCooldown <= 0) {
            const scanResult = passiveScan();
            if (!(scanResult instanceof Error)) {
                this.target = scanResult[0];
                this.passiveScans.unshift(scanResult);
                console.log(this.passiveScans);
            }
            this.passiveCooldown = 100;
        }
        if (this.activeCooldown > 0) {
            this.coolDownTick();
            return;
        }
        const activeScanResult = activeScan(this.navigation.heading - Math.PI / 2, Math.PI, 1000);
        if (!(activeScanResult instanceof Error) && (activeScanResult === null || activeScanResult === void 0 ? void 0 : activeScanResult.length) > 0) {
            this.activeScans.unshift(activeScanResult);
            // const badTargets = activeScanResult.filter((object) => object.closeRange && (object.closeRange.type === 'Asteroid' || object.closeRange.type === 'Meteor'));
            const badTargets = activeScanResult.filter((object) => object.distance < 500);
            badTargets.sort((objectA, objectB) => objectA.distance - objectB.distance);
            this.defenseTarget = badTargets[0];
        }
        else {
            this.defenseTarget = null;
        }
        this.activeCooldown = 25;
        this.coolDownTick();
    }
}
