# Helper Interface

Any home automation system can be plugged-in to this app via a "helper" -- provided it can fufill the "interface" and normalize the accessory data.

Async methods support callbacks, which have also been modelled as events.

## Methods

### ConnectHome

+ With Callbacks

Perform the initial connection, and if necessary, authentication to the home automation system. Then loads the data about the home from the home automation system asynchronously. Fires OnConnectHomeReady callback when everything is complete.

### GetHomeLayout

Synchronously gets the list of rooms, with their accessories and their current state, from the stored data.

### GetAccessoryDataForRoom

Synchronously gets the list of accessories, with the their current state, for a given room.

### UpdateAccessories

+ With Callbacks

Asynchronously updates the state of all accessories in the home, including new structure if the home layout has changed since initially loaded. Fires OnUpdateAccessoriesReady callback when everything is complete.

### SetAccessoryValue

+ With Callbacks

Asynchronously sets a value for an accessory (eg: set a light to on or off). Fires OnSetAccessoryValueReady callback with the response from the home automation system.

## Events

### On<Function>Ready

Called when the function completes successfully

### On<Function>Failure

Called when the function fails

## Accessory Data

Normalized accessory data contains the following members:

+ **uniqueId** - a unique id for each accessory (implementations must create this, if the home automation controller doesn't provide one)
+ **type** - currently supported types are: `lightbulb`
+ **state** - a boolean state for the accessory (eg: on or off for a light bulb, open or closed for a door)
+ **amount** - an analog state for the accessory (eg: brightness for a light bulb, closing for a door, measurement for a sensor)
+ **condition** - string data for the accessory (eg: color value for a light bulb, battery level for a sensor)
+ **data** - any extra data for the accessory from the home controller