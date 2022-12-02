package io.mohamed.rapid.buildserver;

import io.github.classgraph.ClassInfo;
import io.github.classgraph.MethodInfo;
import io.github.classgraph.MethodInfoList;
import io.github.classgraph.MethodParameterInfo;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map.Entry;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class DocumentationGenerator {

	private static final String BASE_URL = "https://developer.android.com/reference/";

	public static HashMap<String, Object> generateDocs(ClassInfo classz) {
		HashMap<String, Object> object = getClassInfo(classz);
		try {
			System.out.println("Generating documentation for: " + classz.getName());
			String url = BASE_URL + classz.getName().replaceAll("\\.", "/");
			System.out.println("Documentation URL: " + url);
			Document document = Jsoup.parse(new URL(url), 20000);
			Element constructors = document.body().select(".constructors").get(0);
			// 1- Parse Constructors
			Elements constructorsElems = constructors.select("tr");
			constructorsElems.remove(0);
			ArrayList<HashMap<String, Object>> constructorsArray = new ArrayList<>();
			for (Element constructorElem : constructorsElems) {
				String constructor = constructorElem.select("td").get(0).select("code").get(0)
					.text();
				Elements constructorDescElems = constructorElem.select("td").get(0).select("p");
				String constructorDesc = "";
				if (!constructorDescElems.isEmpty()) {
					constructorDesc = constructorDescElems.get(0).text();
				}
				HashMap<String, Object> constructorObj = new HashMap<>();
				constructorObj.put("description", constructorDesc);
				String[] params = constructor.replaceAll(".*\\(", "").replaceAll("\\)", "")
					.split(",");
				ArrayList<HashMap<String, String>> paramsArray = new ArrayList<>();
				String[] paramTypes = URLDecoder.decode(
					constructorElem.select("td").get(0).select("code").get(0).select("a").get(0)
						.attr("href").replaceAll(".*\\((.*)\\)", "$1"),
					"utf-8").split(",");
				int i = 0;
				for (String param : params) {
					if (!param.trim().isEmpty()) {
						HashMap<String, String> paramObj = new HashMap<>();
						String type = paramTypes[i].trim();
						String name = param.trim().split(" ")[1].trim();
						paramObj.put("type", type);
						paramObj.put("name", name);
						paramsArray.add(paramObj);
					}
					i++;
				}
				constructorObj.put("parameters", paramsArray);
				constructorsArray.add(constructorObj);
			}
			object.put("constructors", constructorsArray);
			// 2- Parse Fields
			ArrayList<HashMap<String, Object>> fieldsArray = new ArrayList<>();
			Element propertiesElem = document.body().select(".properties").get(0);
			Elements propertiesElems = propertiesElem.select("tbody").get(0).select("tr");
			propertiesElems.remove(0);
			for (Element element : propertiesElems) {
				HashMap<String, Object> fieldObj = new HashMap<>();
				fieldObj.put("name",
					element.select("td").get(1).select("code").get(0).select("a").get(0).ownText());
				Elements descriptionElems = element.select("td").get(1).select("p");
				String description = "";
				if (!descriptionElems.isEmpty()) {
					description = descriptionElems.get(0).text();
				}
				fieldObj.put("description", description);
				fieldObj.put("type", parseTypeFromHTMLTable(element));
				fieldsArray.add(fieldObj);
			}
			object.put("fields", fieldsArray);
			// 3- Parse Methods
			ArrayList<HashMap<String, Object>> methodsArray = new ArrayList<>();
			Element methodsElem = document.body().select(".methods").get(0);
			Elements methodsElems = methodsElem.select("tbody").get(0).select("tr");
			methodsElems.remove(0);
			for (Element element : methodsElems) {
				String method = element.select("td").get(1).select("code").get(0).text();
				System.out.println("method " + method);
				HashMap<String, Object> methodObj = new HashMap<>();
				methodObj.put("name",
					element.select("td").get(1).select("code").get(0).select("a").get(0).ownText());
				Elements descriptionElems = element.select("td").get(1).select("p");
				String description = "";
				if (!descriptionElems.isEmpty()) {
					description = descriptionElems.get(0).text();
				}
				methodObj.put("description", description);
				methodObj.put("type", parseTypeFromHTMLTable(element));
				boolean isStatic = element.select("td").get(0).select("code").get(0).html()
					.contains("static");
				methodObj.put("isStatic", isStatic);
				String[] params = method.replaceAll(".*\\(", "").replaceAll("\\)", "").split(",");
				ArrayList<HashMap<String, Object>> paramsArray = new ArrayList<>();
				System.out.println(element);
				System.out.println(
					element.select("tr").get(0).select("td").get(1).select("code").get(0)
						.select("a")
						.get(0).attr("href"));
				String[] paramTypes = URLDecoder.decode(
					element.select("tr").get(0).select("td").get(1).select("code").get(0)
						.select("a")
						.get(0).attr("href").replaceAll(".*\\((.*)\\)", "$1"),
					"utf-8").split(",");
				System.out.println(Arrays.toString(paramTypes));
				int i = 0;
				System.out.println(Arrays.toString(params));
				for (String param : params) {
					if (!param.trim().isEmpty()) {
						HashMap<String, Object> paramObj = new HashMap<>();
						String type = paramTypes[i].trim();
						String name = param.trim().split(" ")[1].trim();
						paramObj.put("type", type);
						paramObj.put("name", name);
						paramsArray.add(paramObj);
					}
					i++;
				}
				methodObj.put("parameters", paramsArray);
				methodsArray.add(methodObj);
			}
			object.put("methods", methodsArray);
		} catch (Exception ignored) {
		}
		// We couldn't use Android Documentation to find the class information ( Like with 3rd party libraries )
		MethodInfoList constructors = classz.getConstructorInfo();
		ArrayList<HashMap<String, Object>> constructorsArray = new ArrayList<>();
		for (MethodInfo constructor : constructors) {
			HashMap<String, Object> constructorObject = new HashMap<>();
			boolean identical = false;
			if (object.containsKey("constructors")) {
				for (HashMap<String, Object> method1 : (ArrayList<HashMap<String, Object>>) object.get(
					"constructors")) {
					ArrayList<HashMap<String, Object>> parameters = ((ArrayList<HashMap<String, Object>>) method1.get(
						"parameters"));
					System.out.println(parameters);
						if (parameters.size() == constructor.getParameterInfo().length) {
							identical = true;
							for (int i =0; i<parameters.size(); i++) {
								HashMap<String, Object> entry = parameters.get(i);
								if (!entry.get("type").toString().trim().equals(constructor.getParameterInfo()[i].getTypeDescriptor().toString().trim())) {
									identical = false;
								}
								System.out.println("constructor " + constructor + " constructor " + method1 + " constructor " + identical);
							}
						}
					if (identical) {
						constructorObject = method1;
						break;
					}
				}
			}
			if (!identical) {
				MethodParameterInfo[] params = constructor.getParameterInfo();
				ArrayList<HashMap<String, Object>> paramsArray = new ArrayList<>();
				int i = 0;
				for (MethodParameterInfo param : params) {
					HashMap<String, Object> paramObject = new HashMap<>();
					paramObject.put("name",
						param.getName() != null ? param.getName() : ("param" + i));
					paramObject.put("type", param.getTypeDescriptor().toString());
					paramsArray.add(paramObject);
					i++;
				}
				// we don't know the constructor description because it was removed by the JDK
				constructorObject.put("description",
					"Used to create a new " + classz.getSimpleName());
				constructorObject.put("parameters", paramsArray);
			}
			constructorsArray.add(constructorObject);
		}
		ArrayList<HashMap<String, Object>> methodsArray = new ArrayList<>();
		MethodInfoList methods = classz.getMethodInfo();
		System.out.println(methods);
		for (MethodInfo method : methods) {
			boolean identical = false;
			HashMap<String, Object> methodObject = new HashMap<>();
			if (object.containsKey("methods")) {
				for (HashMap<String, Object> method1 : (ArrayList<HashMap<String, Object>>) object.get(
					"methods")) {
					ArrayList<HashMap<String, Object>> parameters = ((ArrayList<HashMap<String, Object>>) method1.get(
						"parameters"));
					if (method.getName().equals(method1.get("name").toString())) {
						if (parameters.size() == method.getParameterInfo().length) {
							identical = true;
							for (int i =0; i<parameters.size(); i++) {
								HashMap<String, Object> entry = parameters.get(i);
								if (!entry.get("type").toString().trim().equals(method.getParameterInfo()[i].getTypeDescriptor().toString().trim())) {
									identical = false;
								}
								System.out.println("method " + method + " method2 " + method1 + " are " + identical);
							}
						}
					}
					if (identical) {
						methodObject = method1;
						break;
					}
				}
			}
			if (!identical) {
				methodObject.put("name", method.getName());
				methodObject.put("type", method.getTypeDescriptor().getResultType().toString());
				methodObject.put("isStatic", Modifier.isStatic(method.getModifiers()));
				ArrayList<HashMap<String, Object>> paramsArray = new ArrayList<>();
				int i = 0;
				for (MethodParameterInfo param : method.getParameterInfo()) {
					HashMap<String, Object> paramObject = new HashMap<>();
					paramObject.put("name",
						param.getName() != null ? param.getName() : ("param" + i));
					paramObject.put("type", param.getTypeDescriptor().toString());
					paramsArray.add(paramObject);
					i++;
				}
				methodObject.put("parameters", paramsArray);
			}
			methodsArray.add(methodObject);
		}
		methodsArray.sort(Comparator.comparing(a -> a.get("name") != null ? a.get("name").toString() : ""));
		object.put("methods", methodsArray);
		object.put("constructors", constructorsArray);
		return object;
	}

	private static HashMap<String, Object> getClassInfo(ClassInfo classz) {
		HashMap<String, Object> classObject = new HashMap<>();
		classObject.put("name", classz.getName());
		classObject.put("package", classz.getPackageName());
		classObject.put("simpleName", classz.getSimpleName());
		classObject.put("type",
			classz.isInterface() ? "interface" : (classz.isEnum() ? "enum" : "class"));
		return classObject;
	}

	private static ArrayList<Integer> indexOfOccurrences(String word, String guess) {
		int index = word.indexOf(guess);
		ArrayList<Integer> list = new ArrayList<>();
		while (index >= 0) {
			list.add(index);
			index = word.indexOf(guess, index + 1);
		}
		return list;
	}

	private static String parseTypeFromHTMLTable(Element element) {
		String typeHtml = element.select("td").get(0).select("code").get(0).html()
			.replaceAll("public", "").replaceAll("static", "").replaceAll("final", "")
			.replaceAll("protected", "").trim();
		typeHtml = typeHtml.replaceAll("<a[^>]*>(.+?)</a>", "\\$HF");
		ArrayList<Integer> integerArrayList = indexOfOccurrences(typeHtml, "$HF");
		if (typeHtml.contains("$HF")) {
			// a type could contain more than a link
			Elements links = element.select("td").get(0).select("code").get(0).select("a");
			String updatedTypeHtml = typeHtml;
			for (Element link : links) {
				int index = links.indexOf(link);
				String link1 = link.attr("href").replaceAll("/reference/", "").replaceAll("/", ".");
				if (integerArrayList.get(index) != 0) {
					updatedTypeHtml = updatedTypeHtml.substring(0,
						indexOfOccurrences(updatedTypeHtml, "$HF").get(0) - 1) + link1
						+ typeHtml.substring(integerArrayList.get(index) + 3);
				} else {
					updatedTypeHtml = link1 + typeHtml.substring(integerArrayList.get(index) + 3);
				}
			}
			typeHtml = updatedTypeHtml;
		}
		if (typeHtml.endsWith(";")) {
			typeHtml = typeHtml.substring(0, typeHtml.length() - 1);
		}
		return unescapeHtml(typeHtml);
	}

	private static String unescapeHtml(String html) {
		return html.replaceAll("&quot", "\"") // " - double-quote
			.replaceAll("&&", "amp") // & - ampersand
			.replaceAll("&lt", "<") // < - less-than
			.replaceAll("&gt", ">")
			.replaceAll("&nbsp", " ");
	}
}
