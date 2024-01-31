import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class JdbcUpdateEx {
    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        //step 1: Load the Driver
        Class.forName("com.mysql.cj.jdbc.Driver");

        //Step 2: Create the Connection
        Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/my_retail","root","Teja@123");
        System.out.println("Connection Created Successfully....."+connection);

        //Step 3: Process the query (write & execute the query)
        Statement statement = connection.createStatement();

        int x = statement.executeUpdate("create table emp(eid number primary key,ename varchar2(30),esal number)");
        System.out.println("Table created successfully...."+x);

        int r1 = statement.executeUpdate("insert into emp values(111,'ratan',10000.45)");
        int r2 = statement.executeUpdate("insert into emp values(222,'anu',20000.45)");
        int r3 = statement.executeUpdate("insert into emp values(333,'sravya',30000.45)");

        System.out.println("Data inserted successfully...."+r1+" "+r2+" "+r3);

        //step 4: Close the Connection
        connection.close();
        System.out.println("Resources are released successfully...");
    }
}