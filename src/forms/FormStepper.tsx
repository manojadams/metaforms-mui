import React, { Fragment, useState } from "react";
import { FormFieldRenderer, IField, IEventPayload, BaseFormStepper, IFormField } from "@manojadams/metaforms-core";
import Stepper, { Orientation } from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Box } from "@mui/material";
import { Row } from "layout-emotions";

export class FormStepper extends BaseFormStepper {
    orientation: Orientation | undefined;

    constructor(props: {fields: Array<IField>, theme: string}) {
        super(props);
        this.sync = this.sync.bind(this);
        const stepper = this.context?.formConfig?.config as Record<string, Orientation>;
        this.orientation = stepper?.orientation ?? "horizontal";
    }

    componentDidMount() {
        const activeIndex = this.context?.page?.pageNumber ? this.context.page.pageNumber - 1 : 1;
        this.setState({
            ...this.state,
            activeIndex
        });
        this.context.listener("switch", (payload: { payload: string; callback?: () => void }) => {
            switch (payload.payload) {
                case "next":
                    this.setActiveIndex(this.state.activeIndex + 1);
                    break;
                case "previous":
                    if (this.state.activeIndex > 0) {
                        this.setActiveIndex(this.state.activeIndex - 1);
                    }
                    break;
            }
        });
        this.context.listener("validation_error", (payload: { payload: string; callback: () => void }) => {
            this.setState({
                error: {
                    hasError: true,
                    section: payload.payload
                }
            });
        });
        this.context.listener("$enable-current-tab", () => {
            const tabField: IField | undefined = this.state.tabFields.find(
                (f: IField, index: number) => index === this.state.activeIndex
            );
            if (tabField) {
                tabField.meta.isDisabled = undefined;
                this.setState({
                    tabFields: [...this.state.tabFields]
                });
            }
        });
        this.context.listener("$end_of_page", (payload: IEventPayload) => {
            this.context.setEndOfPage(payload?.payload as number);
        });

        this.context.listener("$reset_end_of_page", () => {
            this.context.resetEndOfPage();
        });
    }

    componentWillUnmount() {
        this.context.removeListener("switch");
        this.context.removeListener("validation_error");
    }

    render() {
        const section = this.fields.find((_f, i) => i === this.state.activeIndex);
        const fields = section?.fields || [];
        const form = this.context.form[section?.name ?? "default"];
        return (
            <Fragment>
                {this.steps()}
                <Row className="section">
                    {fields.map((field) => 
                        <FormFieldRenderer
                            {...field}
                            key={field.name}
                            section={section?.name ?? ""}
                            form={form[field.name]}
                            sync={this.sync}
                        />
                    )}
                </Row>
            </Fragment>
        );
    }

    steps() {
        const steps = this.fields.map((field) => (field?.meta?.displayName ? field.meta.displayName : field.name));
        return (
            <Box className="meta-form-stepper" data-pagenumber={this.state.activeIndex + 1} sx={{ width: "100%", overflowX: "auto" }}>
                <Stepper activeStep={this.state.activeIndex} alternativeLabel orientation={this.orientation}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
        );
    }

    screens(): JSX.Element {
        return <Fragment />;
    }

    footer() {
        // if (this.state.activeIndex<this.fields.length-1) {
        //     return (
        //         <div className="row text-center">
        //             <div className="col-12 col-md-2">
        //              <button className="btn btn-default d-block w-100 mt-4" onClick={this.next.bind(this)}>Next</button>
        //             </div>
        //         </div>
        //     )
        // }
        return <Fragment />;
    }

    next(e: React.SyntheticEvent) {
        if (this.state.activeIndex < this.fields.length - 1) {
            this.setActiveIndex(this.state.activeIndex + 1);
        }
        e.preventDefault();
    }

    sync() {
        this.setState({...this.state});
    }
}
