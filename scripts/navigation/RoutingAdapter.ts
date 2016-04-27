import IRoutingAdapter from "./IRoutingAdapter";
import IViewModelRegistry from "../registry/IViewModelRegistry";
import AreaRegistry from "../registry/AreaRegistry";
import * as _ from "lodash";
import * as path from "path";
import IPageComponentFactory from "../components/IPageComponentFactory";
import {RouteConfig, PlainRoute} from "react-router";
import {inject, injectable} from "inversify";

@injectable()
class RoutingAdapter implements IRoutingAdapter {

    constructor( @inject("IViewModelRegistry") private registry: IViewModelRegistry,
        @inject("IPageComponentFactory") private pageComponentFactory: IPageComponentFactory) {
    }

    routes(): RouteConfig {
        let areas = this.registry.getAreas();
        return {
            childRoutes: this.getRoutes(areas),
            component: this.pageComponentFactory.componentForUri("/"),
            path: "/"
        };
    }

    private getRoutes(areas: AreaRegistry[]): PlainRoute[] {
        return <PlainRoute[]>_(areas)
            .filter(area => area.area !== "Index")
            .reduce((routes, area) => {
                let route = area.area.toLowerCase();
                routes.push({
                    component: this.pageComponentFactory.componentForUri(route),
                    path: route
                });
                routes.push(this.getRoutesForArea(area));
                return _.flatten(routes);
            }, [])
            .valueOf();
    }

    private getRoutesForArea(area: AreaRegistry): PlainRoute[] {
        return <PlainRoute[]>_(area.entries)
            .filter(entry => entry.id !== "Index" && entry.id !== (area.area + "Index"))
            .reduce((routes, entry) => {
                let route = path.join(area.area.toLowerCase(), entry.id.toLowerCase(), entry.parameters || "");
                routes.push({
                    component: this.pageComponentFactory.componentForUri(route),
                    path: route
                });
                return routes;
            }, [])
            .valueOf();
    }
}

export default RoutingAdapter;