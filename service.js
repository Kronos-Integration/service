/* jslint node: true, esnext: true */

"use strict";


const RootService = {

	/**
	 * Sends a 'stepStateChanged' event to the manager.
	 * arguments are:
	 *  step,oldState,newState
	 * @param {String} oldState
	 * @param {String} newState
	 */
	_stateChanged(oldState, newState) {},

		/**
		 * Called when state transition is not allowed
		 * @param {String} action
		 * @return {Promise} rejecting with an Error
		 */
		rejectWrongState(action) {
			return Promise.reject(new Error(`Can't ${action} ${this} in ${this.state} state`));
		},

		/**
		 * To be overwritten
		 * Overwrite to implement the functionality to bring the step into the running state.
		 * @return {Promise} default implementation always fullfills with the receiving step
		 */
		_start() {
			return Promise.resolve(this);
		},

		start() {
			return this._start().then(() => {
				this.state = 'running';
			});
		},

		/**
		 * To be overwritten
		 * Overwrite to implement the functionality to bring the step into the stopped state.
		 * @return {Promise} default implementation always fullfills with the receiving step
		 */
		_stop() {
			return Promise.resolve(this);
		},

		stop() {
			return this._stop().then(() => {
				this.state = 'stopped';
			});
		},

		/**
		 * Returns the string representation of this step
		 * @return {String} human readable name
		 */
		toString() {
			return this.name;
		}

};

function createService(name, values) {
	let state = "stopped";

	const props = {
		name: {
			value: name
		},
		state: {
			get: function () {
				return state;
			},
			set: function (newState) {
				if (state != newState) {
					const oldState = state;
					state = newState;
					this._stateChanged(oldState, newState);
				}
			}
		}
	};

	for (let key in values) {
		props[key] = {
			value: values[key]
		};
	}

	return Object.create(RootService, props);
}

exports.createService = createService;
