import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import Web3 from "web3";
//import imageConData from '../build/contracts/image.json'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractABI";

//ipfs project credentials
const projectId = "2GIu20VDHamYtvF8P3gjTeXPEhQ";
const projectSecret = "fb48ad793b55ebeccb840b4650fed125";
const auth =
	"Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfs = create({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
	headers: {
		authorization: auth,
	},
});

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			timeInms: 0,
			dateTime: null,
			filename: "",
			timeNhash: [],
			account: "",
			contract: null,
			buffer: null,
			imageHash: "",
			getHash:"",
			imagHashArr: [],
		};
	}
	componentDidMount() {
		this.loadWeb3();
	}

	async loadWeb3() {
		//connect to BC
		const web3 = new Web3(Web3.givenProvider || "http://localhost:7454/");
		//get account and Network
		let network = await web3.eth.net.getNetworkType();
		let networkID = await web3.eth.net.getId();
		let accounts = await web3.eth.requestAccounts();
		console.log("network-" + network + "ID  " + networkID);
		this.setState({ account: accounts[0] });
		//instantiate  the contarct
		const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
		this.setState({ contract: contract });
		console.log(this.state.account);
		console.log(this.state.contract);
	}

	capturefile = (e) => {
		e.preventDefault();
		//Process file for IPFS
		const files = e.target.files;
		console.log(files[0].name);
		this.setState({filename:files[0].name})
		const file = e.target.files[0]; //getting the 1st file from array
		const reader = new FileReader();
		//console.log(reader);
		//method is used to start reading the contents of a specified Blob or File
		reader.readAsArrayBuffer(file);
		reader.onloadend = () => {
			//the result attribute contains an ArrayBuffer representing the file's data.
			this.setState({ buffer: Buffer(reader.result) });
		};
		console.log("file buffer ",this.state.buffer);
	};

	handleSubmit = async (e) => {
		e.preventDefault();
		console.log("submitting to IPFS...");
		//storing to IPFS
		const result = await ipfs.add({
			content: this.state.buffer
		});
		const { path } = result;
		console.log(path);
		console.log(Object.entries(result).map((el) => console.log(el)));
	
		this.setState({ imageHash: path })
		//Create object {time--> filename}
		const Obj = new Object()
		Obj[this.state.dateTime] = this.state.filename;
		this.state.timeNhash.push(Obj)
		//store HASH to BC
		console.log("IPFS HASH BEFORE TO BC", this.state.imageHash)
		await this.state.contract.methods.setHash(
				this.state.timeInms,
				path
			)
			.send({ from: this.state.account }).
			then(function (receipt) {
			console.log(receipt)
			})
	}
	testHandleSubmit = async (e) => {
		e.preventDefault();
		const Obj = new Object()
		Obj[this.state.dateTime] = this.state.filename;
		this.state.timeNhash.push(Obj)
		
		await this.state.contract.methods
			.setHash(
				this.state.timeInms,
				"Qma7vGnBAwkVyyo57G7idfxhU3yEYE7W4rre4fAmUk2T7T"
			)
			.send({ from: this.state.account }).
			then(function (receipt) {
			console.log(receipt)
			})
	}
	handleTime = (e) => {
		e.preventDefault();
		let date = new Date(e.target.value);
		this.setState({ dateTime: date.toLocaleString('en-US') })
		let timeInms = date.getTime();
		this.setState({ timeInms: timeInms });
		console.log("from hanletime" + this.state.timeInms+" date "+date);
	}
	handleGetHash = async () => {
		console.log("from state" + this.state.timeInms);
		//call() does not cost gas send() does
		//const param = this.state.timeInms.toString();
		const hash = await this.state.contract.methods.get(this.state.timeInms).call({ from: this.state.account });
		this.setState({ getHash:hash});
		console.log("getHash- is " + this.state.getHash);
		this.setState({
			imagHashArr: [...this.state.imagHashArr, this.state.getHash],
		})
	}

	//file hash example:Qma7vGnBAwkVyyo57G7idfxhU3yEYE7W4rre4fAmUk2T7T
	render() {
		return (
			<div>
				<nav className="navbar" style={{ backgroundColor: "#e3f2fd" }}>
					<div className="container-fluid mt-2">
						<span className="navbar-brand h1"> UPLOAD IMAGE TO IPFS</span>
						<span className="navbar-brand h6">
							Account : {this.state.account}
						</span>
					</div>
				</nav>
				<div className="container-fluid mt-5 text-center">
					<div className="col col-12 ">
						<div className="border border-info rounded-start rounded-end border-2 mx-5">
							<p>	<strong> Uploaded File Name ------------ Upload Time </strong></p>
							<p>{this.state.timeNhash.map((elm, i) => {
								return (
									<p>{ Object.entries(elm).map((el) => {
											//console.log(el[0], el[1])
											return (
												<p> {el[1]+" ------------ "+el[0] }</p>
											)	}
										)
									}</p>
								)
							})
							}</p>
						</div>
						<br />
					</div>

					<br />
					<div className="row">
						<h3> Uplaod a Image Frame </h3>
						<br />
						<br />
						<br />
						<form onSubmit={this.handleSubmit}>
							<><strong>Input File : </strong></>
							<label htmlFor="formFile" className="form-label">
								<input
									type="file"
									className="form-control"
									onChange={this.capturefile}
									multiple
								/>
							</label>
							<> <strong>Input Time : </strong> </>
							<label htmlFor="timeinput">
								<input
									type="datetime-local"
									//step={1} //seconds
									className="form-control"
									onChange={this.handleTime}
									name="input-time"
								/>
							</label>
							<br />
							<br />
							<input type="submit" className="btn btn-primary" value="Submit" />
						</form>
					</div>
					<hr />
					<br />
					<br />
					<div className="row">
						<div className="col">
							<h3> Get Frame Hash from Blockchain </h3>
							<br />
							<><strong> Input The upload Time of a File : </strong></>
							<label htmlFor="timeinput">
								<input
									type="datetime-local"
									className="form-control"
									name="input-time"
									onChange={this.handleTime}
								
								/>
							</label>
							<strong> Get File Hash : </strong>
							<input
								type="submit"
								value="Get Hash"
								className="btn btn-primary"
								onClick={this.handleGetHash}
							/>
						</div>
						<br />
						<br />
						{ this.state.imagHashArr.map((h, idx) => {
							if (h.length !== 0) {
								let link = "https://ipfs.io/ipfs/" + h;
								return (
									<p> Hash : {h} | IPFS Link :
										<a href={link}>  {h}
										</a>
										<br />
										<br />
										<br />
										<br />
										<img src={`https://ipfs.io/ipfs/${h}`}
											 height={400}
											 width={500 } />
									</p>
								)
							}
						})}
					</div>
				</div>
			</div>
		);
	}
}
