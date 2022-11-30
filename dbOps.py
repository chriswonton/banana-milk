import mysql.connector

class dbOps():

  # Constructor instantiates connection to MySQL db
  def __init__(self):
    self.connection = mysql.connector.connect(
      host='remotemysql.com',
      user='4K8p37H9oN',
      password='yH6LidtJj1',
      database='4K8p37H9oN'
      # user='banana',
      # password='milk',
      # database='BananaMilk'
    )
    self.cursor = self.connection.cursor()
    print("Connection made!")

  # Executes any query
  def execute(self, query):
    self.cursor.execute(query)
    print('Query Executed!')

  # Commits any query that requires commitment
  def commit(self):
    self.connection.commit()

  # Prints value of cursor
  def printCursorResult(self):
    print(self.cursor.fetchall())

  # function for bulk inserting records
  def bulkInsert(self, query, records):
    self.cursor.executemany(query, records)
    self.connection.commit()
    print('Query executed!')

  # function to return a single value from table
  def getSingleRecord(self, query):
    self.cursor.execute(query)
    return self.cursor.fetchone()[0]

  # function to return a single attribute values from table
  def getSingleAttribute(self, query):
    self.cursor.execute(query)
    results = self.cursor.fetchall()
    results = [i[0] for i in results]
    if None in results:
      results.remove(None)
    return results

  # SELECT with named placeholders
  def name_placeholder_query(self, query, dictionary):
    self.cursor.execute(query, dictionary)
    results = self.cursor.fetchall()
    results = [i[0] for i in results]
    return results

  # close connection
  def destructor(self):
    self.connection.close()
