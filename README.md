# XQuery notebook

An experimental XQuery [notebook for VSCode](https://code.visualstudio.com/blogs/2021/11/08/custom-notebooks).

![image](docs/notepad.png)
## Requirements

Requires access to a running BaseX server. The connection uses the Client API.
Settings    
## Usage
### create a notebook
* file>new file>xquery notebook
* cmd `quobook new`
* Explorer new file. Extension `.xqbk` (prefered), or `.xq-notebook`
### add XQuery cells
Adding a code cell defaults to type `xquery`. `Javascript` cells are also supported.
### Header cells
Before executing a XQuery cell, preceding XQuery cells are examined for content starting with '(:<:)' The first such cell, if any, found searching towards the first cell is prefixed to the current cell before execution.
If no `declare base-uri` is present in the header then a `declare base-uri ..` statement with the file based notebook url is prepended to the code.

### mime-type

