from dbOps import dbOps

class dbManager():
  
  # Creates instance of db 
  def __init__(self):
    self.dbConnection = dbOps()
    
  # Creates tables
  def setupTables(self):
    self.createUserTable()
    self.createPlaylistsTable()
    self.createPlaylistsSongsTable()

  # Creates UserAccounts Table that links discord user to lastfm
  def createUserTable(self):
    # Create user table
    # userID: discord ID
    # username: last.fm username (max 15 chars)
    
    query = '''
    CREATE TABLE IF NOT EXISTS UserAccounts(
      userID VARCHAR(25) PRIMARY KEY NOT NULL,
      lastFmUser VARCHAR(15) NOT NULL
    );
    '''

    self.dbConnection.execute(query)
    self.dbConnection.commit()
    print('created tables :)')

  # Creates playlist table 
  def createPlaylistsTable(self):
    query = '''
    CREATE TABLE IF NOT EXISTS Playlists(
      playlistID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
      creatorID INT NOT NULL,
      playlistName VARCHAR(100) NOT NULL,
      playlistDesc VARCHAR(300),
      collaborative BOOLEAN DEFAULT 0
    );
    '''

    self.dbConnection.execute(query)
    self.dbConnection.commit()

  # Inserts new playlist into playlist table
  def insertNewPlaylist(self, cID, pName, pDesc, isCollab):
    insertQuery = '''
    INSERT INTO Playlists(creatorID, playlistName, playlistDesc, collaborative)
    VALUES ('%s', '%s', '%s', %d)
    '''
    self.dbConnection.execute(insertQuery % (cID, pName, pDesc, isCollab))
    self.dbConnection.commit()
    
  # Creates playlist songs table 
  def createPlaylistsSongsTable(self):
    query = '''
    CREATE TABLE IF NOT EXISTS PlaylistsSongs(
      playlistID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
      songID INT NOT NULL
    );
    '''

    self.dbConnection.execute(query)
    self.dbConnection.commit()

  # Inserts new song into PlaylistSongs table, must use playlist name
    
  # Inserts new user into UserAccounts table
  def insertIntoUserTable(self, discord_user, last_fm):
    insertQuery = '''
    INSERT INTO UserAccounts(userID, lastFmUser)
    VALUES ('%s', '%s');
    '''

    self.dbConnection.execute(insertQuery % (discord_user, last_fm))
    self.dbConnection.commit()

  # Updates lastFmUser based on existing userID
  def updateLastFmUser(self, discord_user, last_fm):
    alter_query= '''
    UPDATE UserAccounts
    SET lastFmUser = '%s'
    WHERE userID = '%s';
    '''

    self.dbConnection.execute(alter_query % (last_fm, discord_user))
    self.dbConnection.commit()

  # Select ID from UserAccounts Table  
  def selectFromUserTable(self, discord_user):
    select_query = '''
    SELECT lastFmUser
    FROM UserAccounts
    WHERE userID = '%s';
    '''

    try:
      return self.dbConnection.getSingleAttribute(select_query % discord_user)[0]
    except:
      return 0

  # Removes record from table based on lastFM username
  def removeFromUserTable(self, lastfmUser):
    query = '''
    DELETE FROM UserAccounts
    WHERE lastFmUser = '%s';
    '''

    self.dbConnection.execute(query % lastfmUser)
    self.dbConnection.commit()

# ------ Generic DB Actions ------

  # Drops specific table, be careful U guys
  def dropTable(self, table):
    print('dropped tables :(')
    query = '''
    DROP TABLE %s
    '''

    self.dbConnection.execute(query % table)
    self.dbConnection.commit()

  # Lists all tables in DB
  def listTables(self):
    query = '''
    SHOW TABLES;
    '''

    self.dbConnection.execute(query)
    print("Tables: ")
    self.dbConnection.printCursorResult()

  # Lists all records in a specific table
  def listRecords(self, table):
    query = '''
    SELECT * 
    FROM %s;
    '''

    self.dbConnection.execute(query % table)
    print("Records in", table)
    self.dbConnection.printCursorResult()

  # Lists all tables along with all records from those tables
  def listAllTablesRecords(self, table):
    self.listTables()
    self.listRecords(table)

if __name__ == '__main__':
  test = dbManager()
  # test.setupTables()
  test.listAllTablesRecords('UserAccounts')
  # test.removeFromUserTable('minan)')
  # test.setupTables()
  # test.listTables()
  