#!/python27/python
import cgi, os.path
print "Content-type: text/html\n\n"

def fileToStr(fileName): 
  fin = open(fileName); 
  contents = fin.read();  
  fin.close() 
  return contents

form = cgi.FieldStorage()
pageid = form['page'].value

print fileToStr("pages/page_" + pageid + ".html")

