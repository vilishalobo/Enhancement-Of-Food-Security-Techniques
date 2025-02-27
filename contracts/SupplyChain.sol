// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    enum ShipmentStatus { Pending, InProgress, Delivered }

    struct Product {
        string name;
        uint256 manufacturingDate;
        uint256 expiryDate;
        uint256 price;
        uint256 quantity;
    }

    struct ShipmentDetails {
        uint256 shipmentId;
        address sender;
        address receiver;
        ShipmentStatus status;
        uint256 createdAt;
        uint256 startedAt;
        uint256 completedAt;
        uint256[] productIds;
    }

    mapping(uint256 => ShipmentDetails) public shipments;
    mapping(uint256 => Product) public products;
    mapping(address => string) public users; // Stores registered users and their roles
    uint256 public shipmentCount;
    uint256 public productCount;

    event UserRegistered(address indexed user, string role);
    event ShipmentStatusChanged(
        uint256 indexed shipmentId,
        address indexed sender,
        address indexed receiver,
        ShipmentStatus status,
        uint256 timestamp
    );
    event ProductAdded(
        uint256 indexed shipmentId,
        uint256 indexed productId,
        string name,
        uint256 manufacturingDate,
        uint256 expiryDate,
        uint256 price,
        uint256 quantity
    );

    modifier onlySender(uint256 _shipmentId) {
        require(msg.sender == shipments[_shipmentId].sender, "Only sender can perform this action");
        _;
    }

    modifier onlyReceiver(uint256 _shipmentId) {
        require(msg.sender == shipments[_shipmentId].receiver, "Only receiver can perform this action");
        _;
    }

    // 🔹 **User Registration with MetaMask Signature**
    function registerUser(address _user, string memory _role, bytes memory _signature) public {
        require(bytes(users[_user]).length == 0, "User already registered");
        users[_user] = _role;
        emit UserRegistered(_user, _role);
    }

    // 🔹 **Check if User is Registered**
    function isUserRegistered(address _user) external view returns (bool) {
        return bytes(users[_user]).length > 0;
    }

    function getUserRole(address user) public view returns (string memory) {
    return users[user]; // ✅ FIXED: Use 'users' instead of 'userRoles'
    }

    function createShipment(address _receiver) external {
        shipmentCount++;

        shipments[shipmentCount] = ShipmentDetails({
            shipmentId: shipmentCount,
            sender: msg.sender,
            receiver: _receiver,
            status: ShipmentStatus.Pending,
            createdAt: block.timestamp,
            startedAt: 0,
            completedAt: 0,
            productIds: new uint256[](0)     });

        emit ShipmentStatusChanged(shipmentCount, msg.sender, _receiver, ShipmentStatus.Pending, block.timestamp);
    }

    function startShipment(uint256 _shipmentId) external onlySender(_shipmentId) {
        ShipmentDetails storage shipment = shipments[_shipmentId];
        require(shipment.status == ShipmentStatus.Pending, "Shipment is not in a Pending state");

        shipment.status = ShipmentStatus.InProgress;
        shipment.startedAt = block.timestamp;
        
        emit ShipmentStatusChanged(_shipmentId, shipment.sender, shipment.receiver, ShipmentStatus.InProgress, block.timestamp);
    }

    function completeShipment(uint256 _shipmentId) external onlyReceiver(_shipmentId) {
        ShipmentDetails storage shipment = shipments[_shipmentId];
        require(shipment.status == ShipmentStatus.InProgress, "Shipment must be in progress to complete");

        shipment.status = ShipmentStatus.Delivered;
        shipment.completedAt = block.timestamp;

        emit ShipmentStatusChanged(_shipmentId, shipment.sender, shipment.receiver, ShipmentStatus.Delivered, block.timestamp);
    }

    function addProductToShipment(
        uint256 _shipmentId,
        string memory _name,
        uint256 _manufacturingDate,
        uint256 _expiryDate,
        uint256 _price,
        uint256 _quantity
    ) external onlySender(_shipmentId) {
        ShipmentDetails storage shipment = shipments[_shipmentId];
        require(shipment.status == ShipmentStatus.Pending, "Products can only be added when the shipment is Pending");

        productCount++;
        products[productCount] = Product({
            name: _name,
            manufacturingDate: _manufacturingDate,
            expiryDate: _expiryDate,
            price: _price,
            quantity: _quantity
        });

        shipment.productIds.push(productCount);

        emit ProductAdded(_shipmentId, productCount, _name, _manufacturingDate, _expiryDate, _price, _quantity);
    }

    function getShipment(uint256 _shipmentId) external view returns (ShipmentDetails memory) {
        return shipments[_shipmentId];
    }

    function getProducts(uint256 _shipmentId) external view returns (Product[] memory) {
        ShipmentDetails storage shipment = shipments[_shipmentId];
        uint256 length = shipment.productIds.length;
        Product[] memory shipmentProducts = new Product[](length);

        for (uint256 i = 0; i < length; i++) {
            shipmentProducts[i] = products[shipment.productIds[i]];
        }

        return shipmentProducts;
    }
}
