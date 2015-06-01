#pragma strict
#pragma implicit
#pragma downcast
import System;
import System.Xml;
import System.Xml.Serialization;
import System.IO;
import System.Text;
import System.Security.Cryptography;
//START DATA TO XML\\
// Anything we want to store in the XML file, we define it here
class PlayerData
{
var x : float;
var y : float;
var z : float;
var name : String;
var cells : int;
}
class CollectedItems
{
var cell1 : boolean;
var cell2 : boolean;
var cell3 : boolean;
var cell4 : boolean;
}
// UserData is our custom class that holds our defined objects we want to store in XML format
class UserData
{
// We have to define a default instance of the structure
public var _iUser : PlayerData = new PlayerData();
public var _Collected : CollectedItems = new CollectedItems();
}
//END DATA TO XML\\
//START FILE INFORMATION\\
// This is our local private members
private var _FileLocation : String;
private var _FileName : String = "SaveData.xml";
//END FLIE INFORMATION\\
//START EXTERNAL INFORMATION\\
var _Player : GameObject;
var _PlayerName : String = "Joe Schmoe";
static var cellsStatic : int;
static var cell1Static : boolean;
static var cell2Static : boolean;
static var cell3Static : boolean;
static var cell4Static : boolean;
//END EXTERNAL INFORMATION\\
var SaveIcon : Toggle;
var SaveIconText : Text;
//START TO SERIALIZE DATA\\
private var myData : UserData;
private var myData2 : UserData;
private var _data : String;
private var _dataEncrypt : String;
//END TO SERIALIZE DATA\\
var Key : String = "12345678901234567890123456789012";
private var VPosition : Vector3;
function Awake () {
// Where we want to save and load to and from
_FileLocation=Application.dataPath;
// we need soemthing to store the information into
myData=new UserData();
//Load Data on start scene
if(File.Exists(_FileLocation+"/"+_FileName)){
Load();
Debug.LogError("Loaded");
}
}
function Update () {
if(Input.GetKeyDown(KeyCode.F5)){
Save();
}
if(Input.GetKeyDown(KeyCode.F9)){
Application.LoadLevel("Island");
}
}
var SaveObject : GameObject;
function ClearData (){
File.Delete(_FileLocation+"/"+_FileName);
Debug.LogError("Delete");
if(!File.Exists(_FileLocation+"/"+_FileName)){
Debug.LogError("Deleted");
}
}
function SaveData (){//Unity UI Button don't see Save function, so I create function which invokes them
Save();
}
function Save (){
SaveObject.SetActive (true);
myData._iUser.x = _Player.transform.position.x;
myData._iUser.y = _Player.transform.position.y;
myData._iUser.z = _Player.transform.position.z;
myData._iUser.name = _PlayerName;
myData._iUser.cells = cellsStatic;
myData._Collected.cell1 = cell1Static;
myData._Collected.cell2 = cell2Static;
myData._Collected.cell3 = cell3Static;
myData._Collected.cell4 = cell4Static;
// Time to creat our XML!
_data = SerializeObject(myData);
_dataEncrypt = Encrypt(_data);
// This is the final resulting XML from the serialization process
CreateXML();
Debug.Log(_data);
SaveIcon.isOn = true;
SaveIconText.text = ("Saved!");
yield WaitForSeconds (2);{
SaveObject.SetActive (false);
}
}
function Load (){
LoadXML();
if(_data.ToString() != "")
{
// notice how I use a reference to type (UserData) here, you need this
// so that the returned object is converted into the correct type
myData = DeserializeObject(_data);
// set the players position to the data we loaded
VPosition=new Vector3(myData._iUser.x,myData._iUser.y,myData._iUser.z);
_Player.transform.position=VPosition;
PowerCell.cell1 = myData._Collected.cell1;
PowerCell.cell2 = myData._Collected.cell2;
PowerCell.cell3 = myData._Collected.cell3;
PowerCell.cell4 = myData._Collected.cell4;
Inventory.charge = myData._iUser.cells;
// just a way to show that we loaded in ok
}
}
function UTF8ByteArrayToString(characters : byte[] )
{
var encoding : UTF8Encoding = new UTF8Encoding();
var constructedString : String = encoding.GetString(characters);
return (constructedString);
}
function StringToUTF8ByteArray(pXmlString : String)
{
var encoding : UTF8Encoding = new UTF8Encoding();
var byteArray : byte[] = encoding.GetBytes(pXmlString);
return byteArray;
}
// Here we serialize our UserData object of myData
function SerializeObject(pObject : Object)
{
var XmlizedString : String = null;
var memoryStream : MemoryStream = new MemoryStream();
var xs : XmlSerializer = new XmlSerializer(typeof(UserData));
var xmlTextWriter : System.Xml.XmlTextWriter = new System.Xml.XmlTextWriter(memoryStream, Encoding.UTF8);
xs.Serialize(xmlTextWriter, pObject);
memoryStream = xmlTextWriter.BaseStream; // (MemoryStream)
XmlizedString = UTF8ByteArrayToString(memoryStream.ToArray());
return XmlizedString;
}
// Here we deserialize it back into its original form
function DeserializeObject(pXmlizedString : String)
{
var xs : XmlSerializer = new XmlSerializer(typeof(UserData));
var memoryStream : MemoryStream = new MemoryStream(StringToUTF8ByteArray(pXmlizedString));
var xmlTextWriter : System.Xml.XmlTextWriter = new System.Xml.XmlTextWriter(memoryStream, Encoding.UTF8);
return xs.Deserialize(memoryStream);
}
// Finally our save and load methods for the file itself
function CreateXML()
{
   var writer : StreamWriter;
   var t : FileInfo = new FileInfo(_FileLocation+"/"+ _FileName);
   if(!t.Exists)
   {
      writer = t.CreateText();
   }
   else
   {
      t.Delete();
      writer = t.CreateText();
   }
   writer.Write(_dataEncrypt);
   writer.Close();
   Debug.Log("File written.");
}
 
function LoadXML()
{
   var r : StreamReader = File.OpenText(_FileLocation+"/"+ _FileName);
   var _info : String = r.ReadToEnd();
   r.Close();
   var _infoDecrypt : String;
   _infoDecrypt = Decrypt(_info);
   _data=_infoDecrypt;
   Debug.Log("File Read");
}
function Encrypt(toEncrypt : String )
{
var encoding = System.Text.UTF8Encoding();
var keyArray = encoding.GetBytes(Key);
var toEncryptArray = UTF8Encoding.UTF8.GetBytes (toEncrypt);
 
 var rDel = new RijndaelManaged ();
 rDel.Key = keyArray;
 rDel.Mode = CipherMode.ECB;
 rDel.Padding = PaddingMode.PKCS7;
 
 var cTransform = rDel.CreateEncryptor ();
 var resultArray = cTransform.TransformFinalBlock (toEncryptArray, 0, toEncryptArray.Length);
 return Convert.ToBase64String (resultArray, 0, resultArray.Length);
}

function Decrypt(toDecrypt : String )
{
var encoding = System.Text.UTF8Encoding();
var keyArray = encoding.GetBytes(Key);
var toDecryptArray = Convert.FromBase64String (toDecrypt);
 
 var rDel = new RijndaelManaged ();
 rDel.Key = keyArray;
 rDel.Mode = CipherMode.ECB;
 rDel.Padding = PaddingMode.PKCS7;

 var cTransform = rDel.CreateDecryptor ();
 var resultArray = cTransform.TransformFinalBlock (toDecryptArray, 0, toDecryptArray.Length);
 return UTF8Encoding.UTF8.GetString (resultArray);
}
