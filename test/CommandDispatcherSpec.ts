/// <reference path="../typings/browser.d.ts" />
import "reflect-metadata";
import "bluebird";
import expect = require("expect.js");
import Rx = require("rx");
import sinon = require("sinon");
import CommandDispatcher from "../scripts/commands/CommandDispatcher";
import MockPostCommandDispatcher from "./fixtures/commands/MockPostCommandDispatcher";
import SinonSandboxStatic = Sinon.SinonSandboxStatic;
import SinonSandbox = Sinon.SinonSandbox;
import * as MockCommands from "./fixtures/commands/MockCommands";
import MockWSCommandDispatcher from "./fixtures/commands/MockWSCommandDispatcher";
import MockAuthCommandDispatcher from "./fixtures/commands/MockAuthCommandDispatcher";
import SinonSpy = Sinon.SinonSpy;

describe("Command dispatcher, given a command", () => {

    let sandbox:SinonSandbox;
    let subject:CommandDispatcher;
    let commandDispatcherWS:CommandDispatcher;
    let commandDispatcherAuth:CommandDispatcher;
    let subjectSpy:SinonSpy;
    let commandDispatcherWSSpy:SinonSpy;
    let commandDispatcherAuthSpy:SinonSpy;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        subject = new MockPostCommandDispatcher();
        commandDispatcherWS = new MockWSCommandDispatcher();
        commandDispatcherAuth = new MockAuthCommandDispatcher();
        subjectSpy = sandbox.spy(subject, "internalExecute");
        commandDispatcherWSSpy = sandbox.spy(commandDispatcherWS, "internalExecute");
        commandDispatcherAuthSpy = sandbox.spy(commandDispatcherAuth, "internalExecute");
        subject.setNext(commandDispatcherWS);
        commandDispatcherWS.setNext(commandDispatcherAuth);
    });

    afterEach(() => {
        sandbox.restore();
    });

    context("when it's not decorated with path, transport or authentication", () => {
        it("should be sent with the first dispatcher available", () => {
            subject.dispatch(new MockCommands.DefaultCommand());
            expect(subjectSpy.called).to.be(true);
            expect(commandDispatcherWSSpy.called).to.be(false);
        });
    });

    context("when it's decorated using a different endpoint", () => {
        it("should route the command correctly", () => {
            subject.dispatch(new MockCommands.EndpointCommand());
            expect(subjectSpy.called).to.be(true);
            expect(commandDispatcherWSSpy.called).to.be(false);
            expect(commandDispatcherAuthSpy.called).to.be(false);
        });
    });

    context("when it's decorated using a different transport", () => {
        it("should use those transport", () => {
            subject.dispatch(new MockCommands.TransportCommand());
            expect(subjectSpy.called).to.be(true);
            expect(commandDispatcherWSSpy.called).to.be(true);
            expect(commandDispatcherAuthSpy.called).to.be(false);
        });
    });

    context("when it's decorated using a different authentication strategy", () => {
        it("should authenticate correctly", () => {
            subject.dispatch(new MockCommands.AuthenticationCommand());
            expect(subjectSpy.called).to.be(true);
            expect(commandDispatcherWSSpy.called).to.be(true);
            expect(commandDispatcherAuthSpy.called).to.be(true);
            expect(commandDispatcherAuthSpy.returnValues[0]).to.be(true);
        });
    });
});