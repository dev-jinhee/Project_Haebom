package kr.co.oti.haebom.service;

import java.util.List;
import java.util.Map;

public interface AddressService {
	List<Map<String, Object>> getRegions(String cd);
}
