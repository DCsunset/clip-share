# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.1.0](https://github.com/DCsunset/clip-share/compare/v1.0.3...v1.1.0) (2023-02-13)


### Features

* integrate both webui and server into container ([2dd132a](https://github.com/DCsunset/clip-share/commit/2dd132abdd1a25ac4059c3cc0eedad4489b1e6e3))

### [1.0.3](https://github.com/DCsunset/clip-share/compare/v1.0.2...v1.0.3) (2022-08-26)


### Bug Fixes

* **webui:** fix Icon import to fix rollup build ([5050b15](https://github.com/DCsunset/clip-share/commit/5050b1544c77e4463861f9f4bead2784e1549fee))

### [1.0.2](https://github.com/DCsunset/clip-share/compare/v1.0.1...v1.0.2) (2022-08-26)


### Bug Fixes

* **webui:** fix missing dependency ([75de27c](https://github.com/DCsunset/clip-share/commit/75de27c95401aa9341ffc20e2b53746892c60e1d))

### [1.0.1](https://github.com/DCsunset/clip-share/compare/v1.0.0...v1.0.1) (2022-08-26)

## 1.0.0 (2022-08-26)


### ⚠ BREAKING CHANGES

* **server:** store publicKey at server
* **webui:** use recoil for state management
* **server:** refactor error handling
* **webui:** use effect hook for establishing connection
* **server:** use socket.io for connection

### Features

* **server:** add auth interface ([52da43f](https://github.com/DCsunset/clip-share/commit/52da43f409c118b35de78a3c1e433c5ba04474d5))
* **server:** support partial config ([06220e4](https://github.com/DCsunset/clip-share/commit/06220e48221550ced64a8f756dfa03b1033cdade))
* add Dockerfile for server ([f1de31c](https://github.com/DCsunset/clip-share/commit/f1de31c223b50093f84d81bd62738caea4394db3))
* **server:** add delete event and unpair all devices when deleted ([c84f635](https://github.com/DCsunset/clip-share/commit/c84f635c40982c64429c98cd3ce5f18a136e39eb))
* **server:** add expiryDate to pairEvent ([e3682d9](https://github.com/DCsunset/clip-share/commit/e3682d92726cd820116e154436352b51d51e025f))
* **server:** add name to token payload and fix duplicate checking ([f3a3246](https://github.com/DCsunset/clip-share/commit/f3a324677623a0f3d877513f4c4c972e0d9c41a7))
* **server:** add response type and list command ([0f141c7](https://github.com/DCsunset/clip-share/commit/0f141c77d9a72337cab696f478713ba58eadfede))
* **server:** add share message ([3dd9957](https://github.com/DCsunset/clip-share/commit/3dd9957d37bf694f126360d0c25fd0e9c63fc87c))
* **server:** add unpair event ([3c70280](https://github.com/DCsunset/clip-share/commit/3c70280f2339ff678feace95a3cd9e6be8efe442))
* **server:** broadcast list when new device connects ([194b054](https://github.com/DCsunset/clip-share/commit/194b054878a1b3d5625169adfd0268cdaf2019df))
* **server:** buffer message for offline devices ([2623546](https://github.com/DCsunset/clip-share/commit/2623546d3d77c08e815e161089d988f25857e7e1))
* **server:** handle pair request ([b51120a](https://github.com/DCsunset/clip-share/commit/b51120ae6377fda62c9154ffa07f79878021275d))
* **server:** make fingerprint human-readable ([d581fb8](https://github.com/DCsunset/clip-share/commit/d581fb8c3d4f27d086ea2841e6ac02a50db078a3))
* **server:** store event in buffer and support unpairing offline devices ([c6a11f9](https://github.com/DCsunset/clip-share/commit/c6a11f9045c4935c29b32d15c0f99740a85acea5))
* **server:** store publicKey at server ([b6593dd](https://github.com/DCsunset/clip-share/commit/b6593dd790534344d92d668480a025896b7440fd))
* **server:** support custom port and addr ([7eab0a4](https://github.com/DCsunset/clip-share/commit/7eab0a467840b0027be718d59f9478f521362fc0))
* **server:** use openpgp for crypto ([ac23606](https://github.com/DCsunset/clip-share/commit/ac236067329194c82fb3fcd3f4deb889cba9dcce))
* **server:** use socket.io for connection ([dc5ebce](https://github.com/DCsunset/clip-share/commit/dc5ebcee8635fa8b92425c944e55859c23bcccfe))
* **server:** use socket.io room to forward events ([6d88597](https://github.com/DCsunset/clip-share/commit/6d88597ea6ad8b27d0bdf7d5090952e673b4d06e))
* **webui:** add actions for paired device ([59f6a31](https://github.com/DCsunset/clip-share/commit/59f6a31e7682a1c6c93f2f1fe15e862d58b831ce))
* **webui:** add atom effect to persist data ([429ce5a](https://github.com/DCsunset/clip-share/commit/429ce5a1b254bfc7d4bb7a5e740b86a5fcbf795c))
* **webui:** add autoCopy support ([dadf59b](https://github.com/DCsunset/clip-share/commit/dadf59b0f51d9cf7058deae090a746cc4c513ba1))
* **webui:** add clip sharing ([cfc467e](https://github.com/DCsunset/clip-share/commit/cfc467e800b38fe5497489c34fdf544271801ff8))
* **webui:** add config for auto copy ([5dbb7f5](https://github.com/DCsunset/clip-share/commit/5dbb7f58209fcb891119241ccc2894b8f038eb11))
* **webui:** add DeviceList UI ([5dcfbeb](https://github.com/DCsunset/clip-share/commit/5dcfbeb0b078cf7fec14f46d54003cacdf20d9da))
* **webui:** add DevicePairing component ([a13945f](https://github.com/DCsunset/clip-share/commit/a13945fc9c8745e0e4f1f92c30b4d43669763b86))
* **webui:** add e2e encryption ([1ed338d](https://github.com/DCsunset/clip-share/commit/1ed338ddf68262540aef796c2a830569ba5d2f65))
* **webui:** add fetchingInterval and reconnectionMaxDelay settings ([7d0d617](https://github.com/DCsunset/clip-share/commit/7d0d61722e9ecb4175e01b71a30cb3550797ac4d))
* **webui:** add generateChallengeResponse ([0093c8e](https://github.com/DCsunset/clip-share/commit/0093c8e726ae7689432c3ae74265439a6860df2a))
* **webui:** add icons to DeviceList ([50b1d6c](https://github.com/DCsunset/clip-share/commit/50b1d6cc3f14250d05b6654ad631d9e0ee9217c3))
* **webui:** add key fingerprint and device name in SettingsDialog ([3bd658f](https://github.com/DCsunset/clip-share/commit/3bd658fa9f41d8ce5b1a896d8ec86595eb2a4889))
* **webui:** add key generation and settings initialization ([4a2790b](https://github.com/DCsunset/clip-share/commit/4a2790b602b479033a0920096fa1523199f820bb))
* **webui:** add logo ([b58d7b9](https://github.com/DCsunset/clip-share/commit/b58d7b9d419facca203e29458f8b31c802e73879))
* **webui:** add online status for paired devices ([a80f807](https://github.com/DCsunset/clip-share/commit/a80f8074040d58bd0739e27f63e33443b1c89d46))
* **webui:** add pairing devices and received requests ([1fbef87](https://github.com/DCsunset/clip-share/commit/1fbef8772b7f85e9fca64ca1af2ea375301a892d))
* **webui:** add path prefix to server settings ([91b3978](https://github.com/DCsunset/clip-share/commit/91b3978d9e38646ebf4936a91d2ada103827cb4c))
* **webui:** add react-redux and mui framework ([e9ec7d4](https://github.com/DCsunset/clip-share/commit/e9ec7d4e11539a91e94af8d3592a87e198e898c8))
* **webui:** add serverUrl selector and token field ([530be30](https://github.com/DCsunset/clip-share/commit/530be30dfde13147fd0a370ee056cd875036e1c3))
* **webui:** add SettingsDialog ([7197070](https://github.com/DCsunset/clip-share/commit/719707048aa0e7dbc801a4fbc3b6f64009ae014e))
* **webui:** add timeout for event and implement pairing logic ([24a5b62](https://github.com/DCsunset/clip-share/commit/24a5b622dc22d6eae663434eae3c8d8409dc3030))
* **webui:** add transition to device list ([9019fb6](https://github.com/DCsunset/clip-share/commit/9019fb6656e9f5f585e36b420bf581fe8cf46cc3))
* **webui:** add unpair ([0395743](https://github.com/DCsunset/clip-share/commit/0395743c88a0d78665cc23169324f821c45f9df0))
* **webui:** add validation for settings ([c1422a0](https://github.com/DCsunset/clip-share/commit/c1422a08b0bf37e923d9407e6c47a2b207ff4ae4))
* **webui:** add WebSocket creation and status display ([5dfc669](https://github.com/DCsunset/clip-share/commit/5dfc669acb98593d635ffebc0b8cf15e2ffcd794))
* **webui:** allow copying to clipboard ([54b67aa](https://github.com/DCsunset/clip-share/commit/54b67aafa189aa221d1fb93f8e100a16cc4ac606))
* **webui:** allow updating settings ([812a99c](https://github.com/DCsunset/clip-share/commit/812a99caf54025ed75850de6522d547014294694))
* **webui:** calculate and store id in advance ([4390c2d](https://github.com/DCsunset/clip-share/commit/4390c2d9dbf768d7e1d9ed741830d5f05fb6d821))
* **webui:** define settings in store ([774c3f5](https://github.com/DCsunset/clip-share/commit/774c3f582963dc6dee6a239224352d6fc21e9ff0))
* **webui:** delete current device when re-generating keys ([6d2f6c6](https://github.com/DCsunset/clip-share/commit/6d2f6c67c6d5e162cd889401025c3d3e2e171646))
* **webui:** disable copy when empty ([d2ea096](https://github.com/DCsunset/clip-share/commit/d2ea09635f8e630632874d2d4ffca962ab067330))
* **webui:** fetching device list periodically ([e5c8604](https://github.com/DCsunset/clip-share/commit/e5c8604df588a79217dcc77fde6e69e05049b4c4))
* **webui:** fix and add pairingTimeout to config ([6a82387](https://github.com/DCsunset/clip-share/commit/6a82387d5bd1aaf7ee43f4035649071e383ef6bd))
* **webui:** handle websocket error and list response ([d251f43](https://github.com/DCsunset/clip-share/commit/d251f43e5ec3f1061236b877b07a37c584a187cc))
* **webui:** implement handler to send and accept pair event ([446b188](https://github.com/DCsunset/clip-share/commit/446b1883c55f5f7b6d3cebe65a7ca9d4672dc495))
* **webui:** init config in atom effect ([efdaef6](https://github.com/DCsunset/clip-share/commit/efdaef6bdbc3a325f4e534bfd215a0349bee1391))
* **webui:** persist settings in store ([edf0e3e](https://github.com/DCsunset/clip-share/commit/edf0e3ec79e595b9e18efe1ae273e61cd15b8cff))
* **webui:** remove device upon unpair ([a73ef25](https://github.com/DCsunset/clip-share/commit/a73ef253e7dff1a024947572a85e59edeef4087d))
* **webui:** remove periodical fetching ([5730242](https://github.com/DCsunset/clip-share/commit/5730242f0b2fdca495db6eecdf0a45ad96354ab7))
* **webui:** send unpair event when rejecting ([f535562](https://github.com/DCsunset/clip-share/commit/f5355626ad0f04a8f007a974ae5a29af38096bf1))
* **webui:** show devices ([a1c1fb0](https://github.com/DCsunset/clip-share/commit/a1c1fb0825a5b542971d9c9deb260b4539465928))
* **webui:** support pasting from clipboard ([a86858f](https://github.com/DCsunset/clip-share/commit/a86858fbc60b26690cdbd42fa56b07cb2de2086e))
* **webui:** support sending text and refactor tooltip code ([2916291](https://github.com/DCsunset/clip-share/commit/2916291f11eae0d4118cbcf39dae1317cfab25dd))
* **webui:** switch to open-sans font ([44b85b6](https://github.com/DCsunset/clip-share/commit/44b85b624f62be505f9a75348719c30f50043933))
* **webui:** switch to socket.io-client ([a3bfd1e](https://github.com/DCsunset/clip-share/commit/a3bfd1e33164a26045da7938f0dfee83f38719e2))
* **webui:** use context to share socket ([ac3eb5d](https://github.com/DCsunset/clip-share/commit/ac3eb5d8d33b638843b7ac266ea57a65a6e6a82e))
* **webui:** use recoil state for incoming and outgoing requests ([3aeda9f](https://github.com/DCsunset/clip-share/commit/3aeda9fe7821281900afc0f7166c7f6dfdf3d988))
* **webui:** use tooltip for copy and paste feedback ([621051d](https://github.com/DCsunset/clip-share/commit/621051d172886c2b90bce8dfc621be67d74f7be3))
* **webui:** use tooltip to display status ([7a9e964](https://github.com/DCsunset/clip-share/commit/7a9e964f1c160a844d05355a7319cdff223bad5f))
* **webui:** validate server URL ([fe4710b](https://github.com/DCsunset/clip-share/commit/fe4710b20e1b585a7a161faee78e00041825a065))
* add Layout component ([8a07be0](https://github.com/DCsunset/clip-share/commit/8a07be0c2fc788cff7bacf97af401445faf0b3cd))


### Bug Fixes

* **server:** disconnects orginal socket when online device logs in ([5626ac7](https://github.com/DCsunset/clip-share/commit/5626ac78f5335ea6e1bc9e84a40c5fa8c474a063))
* **server:** exclude current device from list ([0507b7c](https://github.com/DCsunset/clip-share/commit/0507b7ca1fd756775db747784155d17df23ea9ea))
* **server:** fix key exchange ([24ffc9a](https://github.com/DCsunset/clip-share/commit/24ffc9a4a87e652805f37de04c11051563734a4b))
* **server:** fix login ([637ed1d](https://github.com/DCsunset/clip-share/commit/637ed1de74c401220b11fc2a44ad111c823631b4))
* **server:** fix openpgp import ([3e213ae](https://github.com/DCsunset/clip-share/commit/3e213ae103222633df25838822c5a62b8c67b2b4))
* **server:** fix type definition ([9d55613](https://github.com/DCsunset/clip-share/commit/9d556139d2328a51e75b427fbded94915b291b5c))
* **server:** fix unpair event type ([cc79258](https://github.com/DCsunset/clip-share/commit/cc7925859f4762e304583b144bc179683886ac88))
* **server:** handle duplicate login ([a476e98](https://github.com/DCsunset/clip-share/commit/a476e98e5d0ada9748f93d288044d73708bd3e6b))
* **server:** ignore auto generated files in git ([1ad13c5](https://github.com/DCsunset/clip-share/commit/1ad13c5bcecf7212e9a685880e53bc961832afa3))
* **server:** make publicKey mandatory in PairEvent ([34bbaf4](https://github.com/DCsunset/clip-share/commit/34bbaf49244252133c0d45884afb2230a6d07665))
* **server:** push deviceList when any device disconnects ([e96720e](https://github.com/DCsunset/clip-share/commit/e96720ec433b89efbe6a626256d5c01bcfa7a846))
* **server:** remove device on connection close ([c69edf7](https://github.com/DCsunset/clip-share/commit/c69edf70e4c278567290c02f056ad1651680b438))
* **server:** remove name field from token ([2dce137](https://github.com/DCsunset/clip-share/commit/2dce137c631fcecb12a8cf8b5ef481a45ae71f66))
* **server:** use first six bytes as ID ([af69fd1](https://github.com/DCsunset/clip-share/commit/af69fd164b9dd7dd6be0094aafb9ea85cd15b63c))
* **webui:** add general device list helpers and fix device pairing ([5e98b7e](https://github.com/DCsunset/clip-share/commit/5e98b7e36e28df3b59d844c89e7785914dd925b1))
* **webui:** bump dependencies and fix index.tsx ([c13745e](https://github.com/DCsunset/clip-share/commit/c13745ef519496590e216217592088723394b45c))
* **webui:** check expiryDate for outgoing requests ([c0b7d82](https://github.com/DCsunset/clip-share/commit/c0b7d820c041a6547b9c0c238b5a09b831b67426))
* **webui:** comment out autoCopy function due to poor support in some browsers ([88d7184](https://github.com/DCsunset/clip-share/commit/88d7184441db427d4898bca129388191cd1e930d))
* **webui:** exclude local device in new devices ([b0b5826](https://github.com/DCsunset/clip-share/commit/b0b5826a364124b6d60eb10df7f8853fce05efee))
* **webui:** fix a few minor bugs ([bf6d2ec](https://github.com/DCsunset/clip-share/commit/bf6d2ec5786def455fe36fa4bf69b48c2c026f2f))
* **webui:** fix App and index ([a83f351](https://github.com/DCsunset/clip-share/commit/a83f3519dd09bd1ed98ebe632045137301bf8bd7))
* **webui:** fix config dialog and layout ([17601a1](https://github.com/DCsunset/clip-share/commit/17601a1ff82a125ae7b95912987bb207cb837742))
* **webui:** fix connection initialization and teardown ([91a8139](https://github.com/DCsunset/clip-share/commit/91a813946362a4ac58b3bbbc6a7382b44841dfbd))
* **webui:** fix connection setup teardown ([5cd4931](https://github.com/DCsunset/clip-share/commit/5cd49315e9c9dde35685e1236a64658169175c3c))
* **webui:** fix error handling ([4c5c84f](https://github.com/DCsunset/clip-share/commit/4c5c84faed59a8f6b65ccaa7c025f29da5e53bb4))
* **webui:** fix name for reconnectionDelaMax ([0104aaf](https://github.com/DCsunset/clip-share/commit/0104aaf0ffc17d06c510b18bd3c64e21c69aa806))
* **webui:** fix outgoing requests ([c6b913d](https://github.com/DCsunset/clip-share/commit/c6b913d656a72d995f68099ad1f653bcada9f7fb))
* **webui:** fix predicate in newDeviceList ([6040986](https://github.com/DCsunset/clip-share/commit/60409864bb8834d1d7654249424811012a08cb7f))
* **webui:** fix reject handler ([56f7a8b](https://github.com/DCsunset/clip-share/commit/56f7a8b493e8ffa975fb8a99809f4b6c67d579a4))
* **webui:** fix snackbar in DevicePairing ([fd7971d](https://github.com/DCsunset/clip-share/commit/fd7971d2a5d158488a7a66794ece4cdcb7c105e7))
* **webui:** fix socket connection and encryption ([74f1078](https://github.com/DCsunset/clip-share/commit/74f1078e740a7fdecc964630b4ca29e8242a86cf))
* **webui:** fix socket.io connection and error handling ([bf5f0f3](https://github.com/DCsunset/clip-share/commit/bf5f0f3b085c5a049f9b1e4f33c57dd589cea926))
* **webui:** fix spacing for code ([bf80296](https://github.com/DCsunset/clip-share/commit/bf80296475e10b407f6aeaa29e9c152c4e2588b3))
* **webui:** fix status style and settings hint ([6a9ead2](https://github.com/DCsunset/clip-share/commit/6a9ead2ef2443661bd3fd6da9dee8fc28958c659))
* **webui:** fix timeout of tooltips ([d261c0d](https://github.com/DCsunset/clip-share/commit/d261c0d0da8ca4a8153488870776a4ebfb6d2139))
* **webui:** fix tooltips and modularize pairedDevice ([b7383be](https://github.com/DCsunset/clip-share/commit/b7383be25179a93a7ae520f2e2e59f2b6ac7d2fe))
* **webui:** fix type import ([423af76](https://github.com/DCsunset/clip-share/commit/423af76f58a81d53666f56fdeea0c104b571559e))
* **webui:** fix updating settings ([b8eee19](https://github.com/DCsunset/clip-share/commit/b8eee19fcd6d43e0eef67958566108394c95a460))
* **webui:** remove alt text for logo ([e466d57](https://github.com/DCsunset/clip-share/commit/e466d57a944d829e553528bc6705288b87f959af))
* **webui:** remove unnecessary displayId ([03a9cce](https://github.com/DCsunset/clip-share/commit/03a9ccedf7519ecafdf5b35d52108943df849fe7))
* **webui:** update server types ([b6d4a18](https://github.com/DCsunset/clip-share/commit/b6d4a180859f81c521a213c594a1852c3bf76020))
* **webui:** use DateTime.now() instead of local() ([c10a229](https://github.com/DCsunset/clip-share/commit/c10a229f91775037c4571c4d3ffc94d5b3191959))
* fix PairEvent type ([e5c7c1f](https://github.com/DCsunset/clip-share/commit/e5c7c1f3045173b0c781ea259b578ca1f98195d8))
* fix state definition and add helpers ([4edff95](https://github.com/DCsunset/clip-share/commit/4edff95bf7fbcd38e722403d8cc416e80a9638f8))
* **webui:** update types from server module ([e815577](https://github.com/DCsunset/clip-share/commit/e815577f2615ed187a9292e0620e4ad7f5608199))
* **webui:** use flex display for icons ([7b6266a](https://github.com/DCsunset/clip-share/commit/7b6266a57e221e7d877efc1e50b6c0b1378c8cae))


* **server:** refactor error handling ([c40705d](https://github.com/DCsunset/clip-share/commit/c40705d385e1b8e744249002ee4a75802f1e64dd))
* **webui:** use effect hook for establishing connection ([38d55b0](https://github.com/DCsunset/clip-share/commit/38d55b0f28a616bdb6acf86ee45e9314ffb4882e))
* **webui:** use recoil for state management ([595663e](https://github.com/DCsunset/clip-share/commit/595663ea446b455bafa2da79b5688bb1470b33b3))
