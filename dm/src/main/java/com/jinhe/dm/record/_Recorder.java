package com.jinhe.dm.record;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.jinhe.dm.record.ddl._Database;
import com.jinhe.dm.record.ddl._MySQL;
import com.jinhe.tss.framework.component.cache.CacheHelper;
import com.jinhe.tss.framework.persistence.pagequery.PageInfo;
import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;

@Controller
@RequestMapping("/auth/data")
public class _Recorder extends BaseActionSupport {
	
	@Autowired RecordService recordService;
	
	private _Database getDB(Long recordId) {
		String cacheKey = "_db_record_" + recordId;
		_Database _db = (_Database) CacheHelper.getLongerCache().getObject(cacheKey);
		if(_db == null) {
			Record record = recordService.getRecord(recordId);
			CacheHelper.getLongerCache().putObject(cacheKey, _db = new _MySQL(record));
		}
		return _db;
	}
	
    @RequestMapping("/{recordId}/{page}/{pagesize}")
    public void showAsGrid(HttpServletRequest request, HttpServletResponse response, 
            @PathVariable("recordId") Long recordId, 
            @PathVariable("page") int page,
            @PathVariable("pagesize") int pagesize) {
 
        _Database _db = getDB(recordId);
        List<Map<String, Object>> result = _db.select(page, pagesize);
        
        List<IGridNode> temp = new ArrayList<IGridNode>();
		for(Map<String, Object> item : result) {
            DefaultGridNode gridNode = new DefaultGridNode();
            gridNode.getAttrs().putAll(item);
            temp.add(gridNode);
        }
        GridDataEncoder gEncoder = new GridDataEncoder(temp, _db.getGridTemplate());
        
        PageInfo pageInfo = new PageInfo();
        pageInfo.setPageSize(pagesize);
        pageInfo.setTotalRows(result.size());
        pageInfo.setPageNum(page);
        
        print(new String[] {"RecordData", "PageInfo"}, new Object[] {gEncoder, pageInfo});
    }
	
    @RequestMapping(value = "/{recordId}", method = RequestMethod.POST)
    public void create(HttpServletResponse response, 
    		@PathVariable("recordId") Long recordId, 
    		Map<String, String> valuesMap) {
    	
		getDB(recordId).insert(valuesMap );
        printSuccessMessage();
    }
    
    @RequestMapping(value = "/{recordId}/{id}", method = RequestMethod.POST)
    public void update(HttpServletResponse response, 
    		@PathVariable("recordId") Long recordId, 
    		@PathVariable("id") Integer id,
    		Map<String, String> valuesMap) {
    	
		getDB(recordId).update(id, valuesMap);
        printSuccessMessage();
    }
    
    @RequestMapping(value = "/{recordId}/{id}", method = RequestMethod.DELETE)
    public void delete(HttpServletResponse response, 
    		@PathVariable("recordId") Long recordId, 
    		@PathVariable("id") Integer id) {
    	
    	getDB(recordId).delete(id);
        printSuccessMessage();
    }
}
