package kr.co.oti.haebom.business.main.service;

import java.util.List;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import kr.co.oti.haebom.business.main.dto.PopularScenarioDTO;
import kr.co.oti.haebom.business.main.mapper.MainPageMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PopularScenarioService {
    private final MainPageMapper mainPageMapper;
    private final MessageSource messageSource;

    public List<PopularScenarioDTO> getPopularScenarios() {
        List<PopularScenarioDTO> items = mainPageMapper.selectPopularScenariosThisMonth();
        Locale locale = LocaleContextHolder.getLocale();
        for (PopularScenarioDTO item : items) {
            item.setCategoryLabel(messageSource.getMessage(
                    "category." + item.getCategoryName(), null,
                    item.getCategoryName(), locale));
        }
        return items;
    }
}