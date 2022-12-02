package io.mohamed.rapid.buildserver;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map.Entry;

public class ErrorGeneration {

	public static HashMap<String, String> compileErrors = new HashMap<>();

	static {
		compileErrors.put("( expected", "Check that you have filled all of the inputs of the logic blocks and that the parameters of all the functions you have added in your extension is correctly defined.");
		compileErrors.put("class should be declared in file", ""); //should never happen
		compileErrors.put("not a statement", "Please check that your variable names doesn't contain any illegal arguments and that you have filled the inputs of all blocks correctly.");
		compileErrors.put(". expected", "This error could happened due to an incorrectly named package. Check the classes you have imported.");
		compileErrors.put("class, enum or interface expected", "Check that you have filled the inputs of all blocks!");
		compileErrors.put("not abstract", "");
		compileErrors.put(".class expected", "");
		compileErrors.put("classname not enclosing class", "");
		compileErrors.put("not accessible", "");
		compileErrors.put("; expected", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("Comparable cannot be inherited", "");
		compileErrors.put("not found in import", "You have imported a class / library that isn't usable by extensions.");
		compileErrors.put("; missing", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("constructor calls overridden method", "");
		compileErrors.put("not initialised", "");
		compileErrors.put("= expected", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("operator +", "You can't add strings!");
		compileErrors.put("[ expected", "");
		compileErrors.put("duplicate class", "Please attempt to recompile or reload the page. This error could occur due to a wrong package supplied to the Java generator.");
		compileErrors.put("operator ||", "Check that you are using the logic comparing blocks correctly.");
		compileErrors.put("already defined", "You have declared a variable multiple times with the same name.");
		compileErrors.put("duplicate methods", "You have declared a method multiple times with the same name.");
		compileErrors.put("package does not exist", "You have imported a class / library that isn't usable by extensions.");
		compileErrors.put("ambiguous class", "You have imported two classes that have the same name. Try to remove one class and try again.");
		compileErrors.put("enum as identifier", "");
		compileErrors.put("permission denied", "");
		compileErrors.put("array not initialised", "");
		compileErrors.put("error while writing", "");
		compileErrors.put("possible loss of precision", "");
		compileErrors.put("attempt to reference", "You can't add values to list without initalizing it.");
		compileErrors.put("Exception never thrown", "You used a try/catch block to a catch an error that was never thrown by any of the enclosing blocks.");
		compileErrors.put("public class should be in file", "Your class name doesn't match the file name.");
		compileErrors.put("attempt to rename", "");
		compileErrors.put("final parameter may not be assigned", "If you declared a variable as final. It should never be changed after being initialized.");
		compileErrors.put("reached end of file while parsing", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("bad class file", "");
		compileErrors.put("generic array creation", "");
		compileErrors.put("blank final", "When declaring a final variable. You must initalize it to a variable");
		compileErrors.put("identifier expected", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("redefined method", "You have declared a method multiple times with the same name.");
		compileErrors.put("boolean dereferenced", "");
		compileErrors.put("illegal character", "Please check that you didn't use any illegal characters in function or variable names.");
		compileErrors.put("reference ambiguous", "You are calling a method using an unclearly typed value. For example calling the method X which is defined as X(Boolean) and also defined as X(Number) (different types). If you call the method X and use null as the parameter value. It will result in this error as it's unclear which method you want to call.");
		compileErrors.put("bound mismatch", "");
		compileErrors.put("illegal escape", "");
		compileErrors.put("repeated modifier", "");
		compileErrors.put("cannot find symbol", "You are using a variable that is not defined, a method you haven't declared or a class that you haven't imported.");
		compileErrors.put("illegal forward reference", "");
		compileErrors.put("return in constructor", "You are returning a value from an initializing method.");
		compileErrors.put("illegal reference to static", "");
		compileErrors.put("return outside method", "You are returning a value outside a method.");
		compileErrors.put("does not throw", "");
		compileErrors.put("illegal start", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("return required", "");
		compileErrors.put("impotent setters", "");
		compileErrors.put("serialVersionUID required", "");
		compileErrors.put("cannot resolve constructor", "You are attempting to create a class using a non-existing constructor.");
		compileErrors.put("incompatible type", "You are returning a value with a type different that the method return type. Or assigning a value to variable that have a type that isn't compatible with the type you are assigning to it. Please check that your return types are equal to the types you supply.");
		compileErrors.put("should be declared in file", "");
		compileErrors.put("cannot resolve symbol", "You are using a variable that is not defined, a method you haven't declared or a class that you haven't imported.");
		compileErrors.put("instance not accessible", "");
		compileErrors.put("statement expected", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("cannot resolve symbol constructor Thread", "");
		compileErrors.put("invalid declaration", "Please check you are not dots or starting with digits in the name of a method or variable. An exmaple of wrong names: 123method, or 7.method");
		compileErrors.put("static field should be accessed in a static way", "");
		compileErrors.put("cannot resolve symbol this", "");
		compileErrors.put("invalid flag", "");
		compileErrors.put("static not valid on constructor", "Constructors shouldn't be static.");
		compileErrors.put("cannot use operator new", "");
		compileErrors.put("invalid label", "");
		compileErrors.put("superclass not found", "");
		compileErrors.put("can't access class", "You have imported a class / library that isn't usable by extensions.");
		compileErrors.put("invalid method", "Please check that you have defined return type correctly.");
		compileErrors.put("suspicious shadowing", "");
		compileErrors.put("can't be applied", "Please check that you have supplied all the correct parameters for a method.");
		compileErrors.put("invalid type", "");
		compileErrors.put("Tag @see: not found", "");
		compileErrors.put("can't be dereferenced", "");
		compileErrors.put("type can't be private", "");
		compileErrors.put("can't be instantiated", "");
		compileErrors.put("type can't be widened", "");
		compileErrors.put("can't convert from Object to X", "You are trying to use a variable with the type Any with a method or variable that requires a more specific type.");
		compileErrors.put("method cannot hide", "");
		compileErrors.put("type expected", "");
		compileErrors.put("method clone not visible", "");
		compileErrors.put("type safety", "");
		compileErrors.put("method matches constructor name", "Your method's name is the same as the class name.");
		compileErrors.put("type safety: type erased", "");
		compileErrors.put("method not found", "You are calling a method that doesn't exist. Maybe you have imported a class / library that isn't usable by extensions.");
		compileErrors.put("can't make static reference", "You are calling an instance method / variable statically.");
		compileErrors.put("misplaced construct", "");
		compileErrors.put("unchecked conversion", "");
		compileErrors.put("unclosed character literal", "You are using a character and haven't closed it's opening literal <br>( ' )</br>");
		compileErrors.put("char cannot be dereferenced", "");
		compileErrors.put("missing method body", "Check you have defined blocks in functions correctly.");
		compileErrors.put("unclosed String literal", "You are using a character and haven't closed it's opening literal <br>( \" )</br>");
		compileErrors.put("clashes with package", "Your package name is the same as the other class.");
		compileErrors.put("missing public", "");
		compileErrors.put("undefined reference to main", "");
		compileErrors.put("class expected", "");
		compileErrors.put("missing return statement", "Check that you supplied a return value to all your functions.");
		compileErrors.put("undefined variable", "You are using a variable that was never declared.");
		compileErrors.put("class has wrong version", "");
		compileErrors.put("missing variable initialiser", "");
		compileErrors.put("unexpected symbols", "");
		compileErrors.put("class must be defined in a file", "");
		compileErrors.put("modifier synchronized not allowed", "");
		compileErrors.put("unqualified enumeration required", "");
		compileErrors.put("class names only accepted for annotation", "");
		compileErrors.put("name of constructor mismatch", "");
		compileErrors.put("unreachable statement", "");
		compileErrors.put("class names unchecked only accepted", "");
		compileErrors.put("no field", "");
		compileErrors.put("unsorted switch", "");
		compileErrors.put("class not found",  "You have imported a class / library that isn't usable by extensions.");
		compileErrors.put("no method found", "You have used a non-existing method in your blocks.");
		compileErrors.put("void type", "");
		compileErrors.put("class not found in import",  "You have imported a class / library that isn't usable by extensions.");
		compileErrors.put("no method matching", "");
		compileErrors.put("weaker access", "");
		compileErrors.put("class not found in type declaration", "");
		compileErrors.put("non-final variable", "");
		compileErrors.put("{ expected", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("class or interface declaration expected", "Please check you have supplied the inputs of all blocks correctly.");
		compileErrors.put("} expected", "Please check you have supplied the inputs of all blocks correctly.");
	}

	public enum ErrorType {

		COMPILE(0),
		ANDORID_MANIFEST(1),
		JAR(2),
		UNJAR(3),
		PROGUARD(4),
		GENERATE_EXTENSIONS(5),
		D8(6),
		PACK_EXTENSIONS(7),
		UNKNOWN(8);

		int error = 0;

		ErrorType(int i) {
			this.error = i;
		}

		@Override
		public String toString() {
			return String.valueOf(error);
		}
	}

	public static class Error {

		private final String error;
		private final ErrorType type;

		public Error(String error, ErrorType type) {
			this.error = error;
			this.type = type;
		}

		public String getError() {
			return error;
		}

		public ErrorType getType() {
			return type;
		}

		@Override
		public String toString() {
			// 1 - Find error message for error type
			String errorTypeStr;
			ArrayList<String> whatToDo = new ArrayList<>();
			switch (getType()) {
				case COMPILE:
					errorTypeStr = "An error occurred while compiling your project's blocks.";
					break;
				case ANDORID_MANIFEST:
					errorTypeStr = "An error occurred while parsing your android manifest.";
					whatToDo.add("Please Check that your extension manifest is valid. You could check it from ( Project -> Options > Mnaifest ).");
					break;
				case JAR:
					errorTypeStr = "An unexpected error occurred, not because of your blocks, but due to failure of creating a JAR executable for your extension.";
					break;
				case UNJAR:
					errorTypeStr = "An unexpected error occurred, not because of your blocks, but due to failure of extracting classes for your libraries.";
					whatToDo.add("Please check that your library files are valid JAR files.");
					break;
				case GENERATE_EXTENSIONS:
					errorTypeStr = "An unexpected error occurred, not because of your code, but due to failure of generating extension files for your project.";
					break;
				case PROGUARD:
					errorTypeStr = "An error occurred while proguarding your extension.";
					whatToDo.add("Please try disabling proguard and attempting to compile again.");
					break;
				case D8:
					errorTypeStr = "An error occurred while creating DEX files for your extension.";
					break;
				case PACK_EXTENSIONS:
					errorTypeStr = "An erorr occurred while create the final .AIX file for your project.";
						break;
				case UNKNOWN:
				default:
					errorTypeStr = "An unexpected error occurred while compiling your project.";
					break;
			}
			// 2- If it's a compile error, report the message for it.
			if (type.equals(ErrorType.COMPILE)) {
				String whatToDoJava = parseCompileError(error);
					if (!whatToDoJava.isEmpty()) {
						whatToDo.add(whatToDoJava);
					}
			}
			// 3- Create the final error string
			StringBuilder whatToDoBuilder = new StringBuilder();
			for (String str : whatToDo) {
				whatToDoBuilder.append(whatToDo.indexOf(str) + 1).append("- ").append(str).append("<br>");
			}
			whatToDoBuilder.append(whatToDo.size() + 1).append("- ").append(
				"Check if there are any warnings displayed in the block editor and try to solve them.<br>");
			whatToDoBuilder.append(whatToDo.size() + 2).append("- ").append("Try to rebuild your project.<br>");
			whatToDoBuilder.append(whatToDo.size() + 3).append("- ").append(
				"If the error persists, please search our <a href=\"https://community.rapidbuilder.tech\">community</a> for similar issues. If you didn't find any, please create a new topic.");

			String whatToDoStr = whatToDoBuilder.toString();
			return
				errorTypeStr + ":<br>" + "Error: " + getError() + "<br> <h3>What To Do?</h3><br>" + whatToDoStr;
		}
	}

	public static ArrayList<HashMap<String, String>> parseErrors(ArrayList<Error> errors) {
		ArrayList<HashMap<String, String>> result = new ArrayList<>();
		if (errors == null) {
			return result;
		}
		for (Error error : errors) {
			HashMap<String, String> obj = new HashMap<>();
			obj.put("error", error.getError());
			obj.put("userErrorStr", error.toString());
			result.add(obj);
		}
		return result;
	}

	public static String parseCompileError(String error) {
		for (Entry<String, String> entry : compileErrors.entrySet()) {
			if (error.contains(entry.getKey())) return entry.getValue();
		}
		return "";
	}
}
