// grab inputs/buttons in doc
const nameInput = document.getElementById("name")
const symbolInput = document.getElementById("symbol")
const decimalsInput = document.getElementById("decimals")

const premintButton = document.getElementById("preminted")
const mintableButton = document.getElementById("mintable")
const burnableButton = document.getElementById("burnable")
const cappedButton = document.getElementById("capped")

const premintInput = document.getElementById("premint")
const premintLabel = document.getElementById("premintLabel")
const capInput = document.getElementById("cap")
const capLabel = document.getElementById("capLabel")

const contractCode = document.getElementById("contractCode")

// const form = document.querySelector('form[name="calebForm"]')
// const ccValidation = form.elements["name"].value
// const ccType = form.elements["symbol"].value
// console.log(ccValidation)
// console.log(ccType)

// declare variables
let SPDX = "MIT" // will allow to be edited in a later version
let version = "^0.8.4" // will allow to be edited in a later version

let name = nameInput.value
let symbol = symbolInput.value
let decimals = decimalsInput.value
let cap = capInput.value

let preminted = false
let mintable = false
let burnable = false
let capped = false

// console.log(name)
// console.log(symbol)
// console.log(decimals)
// console.log(cap)
// console.log(premint)
// console.log(mintable)
// console.log(burnable)
// console.log(capped)

// add event listeners
premintButton.addEventListener("click", () => {
    preminted = !preminted
    console.log("premint: ", preminted)
    if (preminted) {
        premintInput.style.display = "block"
        premintLabel.style.display = "block"
    } else {
        premintInput.style.display = "none"
        premintLabel.style.display = "none"
    }
    buildContract()
})
mintableButton.addEventListener("click", () => {
    mintable = !mintable
    console.log("mintable: ", mintable)
    buildContract()
})
burnableButton.addEventListener("click", () => {
    burnable = !burnable
    console.log("burnable: ", burnable)
    buildContract()
})
cappedButton.addEventListener("click", () => {
    capped = !capped
    console.log("capped: ", capped)
    if (capped) {
        capInput.style.display = "block"
        capLabel.style.display = "block"
    } else {
        capInput.style.display = "none"
        capLabel.style.display = "none"
    }
    buildContract()
})

nameInput.addEventListener("input", (e) => {
    name = e.target.value
    console.log(name)
    buildContract()
})
symbolInput.addEventListener("input", (e) => {
    symbol = e.target.value
    console.log(symbol)
    buildContract()
})
decimalsInput.addEventListener("input", (e) => {
    decimals = e.target.value
    console.log(decimals)
    buildContract()
})
capInput.addEventListener("input", (e) => {
    cap = e.target.value
    console.log(cap)
    buildContract()
})

// display contract string to console for now
// console.log(contract);

// document.addEventListener('keypress', () => {
//     contractCode.innerText = buildContract();
// })

function buildContract() {
    let contract = `
// SPDX-License-Identifier: ${SPDX}
pragma solidity ${version};

contract ${name} {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    `

    if (capped) {
        contract += "uint256 private immutable _cap;\n"
    }

    contract += `
    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() public {
        _name = \"${name}\";
        _symbol = \"${symbol}\";
        _decimals = ${decimals};
        `
    if (capped) {
        contract += `_cap = ${cap};`
    }

    contract += `
    }
    `

    const middleSection = `
    function name() public view virtual returns (string memory) {
        return _name;
    }
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }
    function decimals() public view virtual returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = msg.sender;
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
`

    // contract += middleSection;

    if (burnable) {
        contract += `
    function burn(uint256 amount) public virtual {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public virtual {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }
    `
    }
    if (capped) {
        contract += `
    function cap() public view virtual returns (uint256) {
        return _cap;
    }
    `
    }
    if (mintable) {
        contract += `
    function mint(address account, uint256 amount) public virtual {
        require(totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        _mint(account, amount);
    }
`
    }

    contract += `
}
`

    contractCode.innerHTML = contract
}
