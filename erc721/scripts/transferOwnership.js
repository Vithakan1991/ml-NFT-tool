const MorpheusNftManagerInfo = artifacts.require("MorpheusNftManagerInfo");
const MorpheusNftManager = artifacts.require("MorpheusNftManager");

const MorpheusNftManagerInfo_Address =
  "0xb32d40342918b1d6de4c0bf23d61be325c86cbc8";

const MorpheusNftManager_Address = "0x8c7a476D48CFd339480dd323e6Afa1F7C7cE4c49";

const newOwnerAddress = "0x32Ddbb3164E988C6661B09aAdc75992ce3f36fFD";

module.exports = async function () {
  // MorpheusNftManagerInfo
  try {
    const infoContractInst = await MorpheusNftManagerInfo.at(
      MorpheusNftManagerInfo_Address
    );
    const infoContractOwner = await infoContractInst.owner();
    console.log("MorpheusNftManagerInfo Current Owner:", infoContractOwner);

    const txTransferOwnershipInfoContract = await infoContractInst.transferOwnership(
      newOwnerAddress
    );

    if (txTransferOwnershipInfoContract.receipt.status === true) {
      const infoContractOwnerNew = await infoContractInst.owner();
      console.log("MorpheusNftManagerInfo New Owner:", infoContractOwnerNew);
    } else {
      console.error("Failed to transfer ownership of MorpheusNftManagerInfo");
    }
  } catch (err) {
    console.error("Failed to transfer ownership of MorpheusNftManagerInfo");
  }

  // MorpheusNftManager
  try {
    const managerContractInst = await MorpheusNftManager.at(
      MorpheusNftManager_Address
    );
    const managerContractOwner = await managerContractInst.owner();
    console.log("MorpheusNftManager Current Owner:", managerContractOwner);

    const txTransferOwnershipContract = await managerContractInst.transferOwnership(
      newOwnerAddress
    );

    if (txTransferOwnershipContract.receipt.status === true) {
      const managerContractOwnerNew = await managerContractInst.owner();
      console.log("MorpheusNftManager New Owner:", managerContractOwnerNew);
    } else {
      console.error("Failed to transfer ownership of MorpheusNftManager");
    }
  } catch (err) {
    console.error("Failed to transfer ownership of MorpheusNftManager");
  }

  process.exit(0);
};
