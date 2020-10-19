import { BrowserJsPlumbDefaults, BrowserJsPlumbInstance } from "./browser-jsplumb-instance";
import { jsPlumbHelperFunctions } from '../core/defaults';
export * from "./dot-endpoint-renderer";
export * from "./rectangle-endpoint-renderer";
export * from "./blank-endpoint-renderer";
export * from '../core/endpoint/blank-endpoint';
export * from '../core/endpoint/rectangle-endpoint';
export * from '../core/endpoint/dot-endpoint';
export * from '../core/connector/bezier-connector';
export * from '../core/connector/straight-connector';
export * from '../core/connector/flowchart-connector';
export * from '../core/connector/statemachine-connector';
export { EventManager } from './event-manager';
export { extend } from '../core/core';
export declare function newInstance(defaults?: BrowserJsPlumbDefaults, helpers?: jsPlumbHelperFunctions): BrowserJsPlumbInstance;
export declare function ready(f: Function): void;
