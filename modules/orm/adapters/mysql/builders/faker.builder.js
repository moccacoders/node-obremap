import faker from "faker";
import adapter from '../index'
import "../../../../config/prototypes.config.js"

export default class Faker {
	faker = faker;
	data = [];

	constructor(options){
		this.model = options.model
		delete options.model;
		this.options = options
	}

	fixed (...data) {	
		return this.createFake("fixed", data)
	}

	times (times) {
		this.times = times;
		return this;
	}

	locale (locale) {
		this.faker.locale(locale)
		return this;
	}

	/* METHODS */
	address (type=false) {
		return this.createFake("address", type)
	}

	commerce (...type) {
		return this.createFake("commerce", type)
	}

	company (...type) {
		return this.createFake("company", type)
	}

	database (...type) {
		return this.createFake("database", type)
	}

	date (...type) {
		return this.createFake("date", type)
	}

	fake (str) {
		return this.faker.fake(str)
	}

	finance (...type) {
		return this.createFake("finance", type)
	}

	git (...type) {
		return this.createFake("git", type)
	}

	hacker (...type) {
		return this.createFake("hacker", type)
	}

	helpers (...type) {
		return this.createFake("helpers", type)
	}

	image (...type) {
		return this.createFake("image", type)
	}

	internet (...type) {
		return this.createFake("internet", type)
	}

	lorem (...type) {
		return this.createFake("lorem", type)
	}

	name (...type) {
		return this.createFake("name", type)
	}

	number (...type) {
		return this.createFake("number", type)
	}

	phone (...type) {
		return this.createFake("phone", type)
	}

	random (...type) {
		return this.createFake("random", type)
	}

	randomOptions (...data) {
		return this.createFake("randomOptions", data)
	}

	system (...type) {
		return this.createFake("system", type)
	}

	time (...type) {
		return this.createFake("time", type)
	}

	unique (...type) {
		return this.createFake("date", type)
	}

	vehicle (...type) {
		return this.createFake("date", type)
	}

	/* GENERALS */
	createFake (method, type) {
		let other = null;
		type = type.map(item => {
			let type = null;
			if(typeof item == "object"){
				let {type, ...others} = item;
				item.type = type;
				other = others;
			}
			return item.type;
		})
		if(type) type = type.wrap();
		this.data.push({ method, type, ...other });
		return this;
	}

	/* MAKE */
	make () {
		let fake = [];
		let consecutive = 1;
		let times = this.times;
		while(this.times > 0){
			this.data.map(item => {
				let data = null;
				if(!fake[this.times]) fake[this.times] = {};
				if(item.type.length > 0){
					item.type.map(type => {
						if(this.faker[item.method] && typeof this.faker[item.method][type] != "undefined"){
							fake[this.times][item.name || item.method] = this.faker[item.method][type]();
						}

						if(item.method == "number"){
							if(type == "consecutive"){
								data = this.times;
							}
							data = Math.floor(Math.random() * (((item.max+1)||times) - (item.min||1)) + (item.min||1));
						}
					})					
				}

				if(item.method == "randomOptions"){
					data = item.options[Math.floor(Math.random() * item.options.length)]
				}
				if(item.method == "fixed")
					data = item.value

				if(data)
					fake[this.times][item.name || item.method] = data
			})
			this.times--;
		}
		fake = fake.wrap()
		return fake;
	}
}