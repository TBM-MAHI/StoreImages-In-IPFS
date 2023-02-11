const { assert } = require("chai");

const stHashContract = artifacts.require("storeHash");

require("chai").
	use(require("chai-as-promised")).
	should();

contract('stHashContract', (accounts) => {
	let con;
	//this will allow to run some code before each test cases
	before(async () => {
		con = await stHashContract.deployed();
	})
	describe("deployment", async () => {
		it(" contract deploy successful", async () => {
			let conAddress = con.address;
			assert.notEqual(conAddress, '')
			assert.notEqual(conAddress, null)
			assert.notEqual(conAddress,undefined)
			assert.notEqual(conAddress,0x0)
			console.log(conAddress);
		})
	})

	describe('storage', async () => {
		it('update the image hash', async () => {
			let imgHash = 'QmcLs6qVS3R7dShrwHymU3sc3TtmB7SVSK9uTmYmHMBXNj';
			let time = 65656595995;
			await con.setHash(time,imgHash)
			const result = await con.get(65656595995)
			console.log(result)
			assert.equal(result, imgHash)
			
		})
	})
})
