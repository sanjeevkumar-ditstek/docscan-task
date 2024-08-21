// import IROLE from "../../utils/interface/role/IRole";
// import { RoleModel } from "../../db/roles";

// export default class RoleStore {
// 	public static OPERATION_UNSUCCESSFUL = class extends Error {
// 		constructor() {
// 			super("An error occured while processing the request.");
// 		}
// 	};

// 	/**
// 	 * creating new user and saving in Database
// 	 */
// 	public async createRole(roleInput: IROLE): Promise<IROLE> {
// 		try {
// 			let savedRole:any = await RoleModel.create(roleInput);
// 			return savedRole;
// 		} catch (error) {
// 			return error;
// 		}
// 	}

// 	/**
// 	 *Get by email
// 	 */
// 	public async getByName(name: string): Promise<IROLE> {
// 		try {
// 			let role: any = (await RoleModel.findOne({ name }));
// 			return role;
// 		} catch (e) {
// 			return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
// 		}
// 	}

// 	/**
// 	 *Get by id
// 	 */
// 	public async getById(id: string): Promise<IROLE> {
// 		try {
// 			let role: any = await RoleModel.findOne({_id : id});
// 			return role;
// 		} catch (e) {
// 			return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
// 		}
// 	}

// 	public async getAll(): Promise<IROLE[]> {
// 		try {
// 			let roles: any = await RoleModel.find();
// 			return roles
// 		} catch (e) {
// 			return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
// 		}
// 	}

// 	public async updateById(id: string , payload: any): Promise<IROLE> {
// 		try {
// 			let role: any = await RoleModel.findOneAndUpdate({_id: id} , payload);
// 			return role
// 		} catch (e) {
// 			return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
// 		}
// 	}

// 	public async delete(id: string): Promise<IROLE> {
// 		try {
// 			let role: any = await RoleModel.findOneAndDelete({_id: id});
// 			return role
// 		} catch (e) {
// 			return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
// 		}
// 	}
// }
