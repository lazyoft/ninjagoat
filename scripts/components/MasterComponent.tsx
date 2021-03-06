import * as React from "react";
import * as Area from "../constants/Area";

export default React.createClass({
    render() {
        let View = this.view;
        let ViewModel = this.viewmodel;
        return <View viewmodel={ViewModel} children={this.props.children} />
    },
    componentWillMount() {
        let context = this.props.contextFactory.contextFor(Area.Master);
        this.view = context.view;
        this.viewmodel = context.viewmodel;
        this.setState(this.viewmodel);
        context.viewmodel.subscribe(() => this.setState(context.viewmodel));
    }
});